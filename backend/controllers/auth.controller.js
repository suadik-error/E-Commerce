import User from "../model/user.model.js";
import Manager from "../model/manager.model.js";
import Agent from "../model/agent.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js"

const generateToken = ({ userId, role }) =>{
    const accessToken = jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",

    })

    const refreshToken =jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: "7d",
    })

    return { accessToken, refreshToken }
}

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 60 * 60 * 24 * 7); // 7 days
}


const setCookies = (res, accessToken, refreshToken) => {
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
    };

     res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}

export const signup = async (req, res) => {
	const { name, email, password, } = req.body;
	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}
		const user = await User.create({ name, email, password });

		// authenticate
		const { accessToken, refreshToken } = generateToken({
			userId: user._id,
			role: user.role,
		});
		await storeRefreshToken(user._id, refreshToken);

		setCookies(res, accessToken, refreshToken);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		});
		
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ message: error.message });
	}
};



export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (user && (await user.comparePassword(password))) {
			const { accessToken, refreshToken } = generateToken({
				userId: user._id,
				role: user.role,
			});
			await storeRefreshToken(user._id, refreshToken);
			setCookies(res, accessToken, refreshToken);

			res.status(200).json({
				message: "Login successful",
				user:{
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,	
				}
				
			});
		} else {
			res.status(400).json({ message: "Invalid email or password" });
		}
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		const isProd = process.env.NODE_ENV === "production";
		const cookieOptions = {
			httpOnly: true,
			secure: isProd,
			sameSite: isProd ? "none" : "lax",
		};
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken) {
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			await redis.del(`refresh_token:${decoded.userId}`);
		}

		res.clearCookie("accessToken", cookieOptions);
		res.clearCookie("refreshToken", cookieOptions);
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const refreshToken = async (req, res) => {
    try {
        const isProd = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
        };
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

        if (storedToken !== refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const user = await User.findById(decoded.userId);

        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

        res.json({ message: "Token refreshed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


export const getProfile = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateProfile = async (req, res) => {
	try {
		const {
			name,
			email,
			notifications,
			theme,
			language,
			timezone,
			twoFactor,
		} = req.body;

		const updates = {};
		const uploadedProfilePicture = req.file?.path;

		if (typeof name === "string" && name.trim()) {
			updates.name = name.trim();
		}

		if (typeof email === "string" && email.trim()) {
			const normalizedEmail = email.toLowerCase().trim();
			const existing = await User.findOne({
				email: normalizedEmail,
				_id: { $ne: req.user._id },
			});
			if (existing) {
				return res.status(400).json({ message: "Email already in use" });
			}
			updates.email = normalizedEmail;
		}

		if (typeof notifications === "boolean") {
			updates.notifications = notifications;
		} else if (typeof notifications === "string") {
			updates.notifications = notifications.toLowerCase() === "true";
		}

		if (typeof theme === "string" && ["light", "dark", "auto"].includes(theme)) {
			updates.theme = theme;
		}

		if (typeof language === "string" && language.trim()) {
			updates.language = language.trim();
		}

		if (typeof timezone === "string" && timezone.trim()) {
			updates.timezone = timezone.trim();
		}

		if (typeof twoFactor === "boolean") {
			updates.twoFactor = twoFactor;
		} else if (typeof twoFactor === "string") {
			updates.twoFactor = twoFactor.toLowerCase() === "true";
		}

		if (uploadedProfilePicture) {
			updates.profilePicture = uploadedProfilePicture;
		}

		const currentEmail = req.user.email;
		const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
			new: true,
			runValidators: true,
		}).select("-password");

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		if (req.user.role === "manager") {
			await Manager.findOneAndUpdate(
				{ email: currentEmail },
				{
					...(updates.name ? { name: updates.name } : {}),
					...(updates.email ? { email: updates.email } : {}),
				}
			);
		}

		if (req.user.role === "agent") {
			await Agent.findOneAndUpdate(
				{ email: currentEmail },
				{
					...(updates.name ? { name: updates.name } : {}),
					...(updates.email ? { email: updates.email } : {}),
				}
			);
		}

		res.status(200).json(updatedUser);
	} catch (error) {
		res.status(500).json({ message: "Failed to update profile" });
	}
};

export const changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({ message: "currentPassword and newPassword are required" });
		}

		if (String(newPassword).length < 8) {
			return res.status(400).json({ message: "New password must be at least 8 characters long" });
		}

		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const matches = await user.comparePassword(currentPassword);
		if (!matches) {
			return res.status(400).json({ message: "Current password is incorrect" });
		}

		user.password = newPassword;
		await user.save();

		res.status(200).json({ message: "Password changed successfully" });
	} catch (error) {
		res.status(500).json({ message: "Failed to change password" });
	}
};
