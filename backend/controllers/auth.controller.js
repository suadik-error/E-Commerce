import User from "../model/user.model.js";
import Manager from "../model/manager.model.js";
import Agent from "../model/agent.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js"

const DEFAULT_SESSION_TIMEOUT_MINUTES = 15;
const MIN_SESSION_TIMEOUT_MINUTES = 15;
const MAX_SESSION_TIMEOUT_MINUTES = 60;
const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{6})$/;

const normalizeSessionTimeout = (value) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
        return DEFAULT_SESSION_TIMEOUT_MINUTES;
    }

    return Math.min(MAX_SESSION_TIMEOUT_MINUTES, Math.max(MIN_SESSION_TIMEOUT_MINUTES, parsed));
};

const generateToken = ({ userId, role, sessionTimeout }) =>{
    const timeoutMinutes = normalizeSessionTimeout(sessionTimeout);
    const accessToken = jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: `${timeoutMinutes}m`,

    })

    const refreshToken =jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: "7d",
    })

    return { accessToken, refreshToken, accessTokenTtlMinutes: timeoutMinutes }
}

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 60 * 60 * 24 * 7);
}

const getCookieOptions = () => {
    const secureCookie =
        process.env.COOKIE_SECURE === "true" ||
        process.env.NODE_ENV === "production" ||
        process.env.RENDER === "true";

    return {
        httpOnly: true,
        secure: secureCookie,
        sameSite: secureCookie ? "none" : "lax",
        path: "/",
    };
};

const setCookies = (res, accessToken, refreshToken, accessTokenTtlMinutes = DEFAULT_SESSION_TIMEOUT_MINUTES) => {
    const cookieOptions = getCookieOptions();
    const timeoutMinutes = normalizeSessionTimeout(accessTokenTtlMinutes);

     res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: timeoutMinutes * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
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

		const { accessToken, refreshToken, accessTokenTtlMinutes } = generateToken({
			userId: user._id,
			role: user.role,
            sessionTimeout: user.sessionTimeout,
		});
		await storeRefreshToken(user._id, refreshToken);

		setCookies(res, accessToken, refreshToken, accessTokenTtlMinutes);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			accessToken,
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
			const { accessToken, refreshToken, accessTokenTtlMinutes } = generateToken({
				userId: user._id,
				role: user.role,
                sessionTimeout: user.sessionTimeout,
			});
			await storeRefreshToken(user._id, refreshToken);
			setCookies(res, accessToken, refreshToken, accessTokenTtlMinutes);

			res.status(200).json({
				message: "Login successful",
				accessToken,
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
		const cookieOptions = getCookieOptions();
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
        const cookieOptions = getCookieOptions();
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

        const timeoutMinutes = normalizeSessionTimeout(user?.sessionTimeout);
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: `${timeoutMinutes}m` }
        );

        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: timeoutMinutes * 60 * 1000,
        });

        res.json({ message: "Token refreshed successfully", accessToken });
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
			companyName,
			primaryColor,
			accentColor,
			sidebarPlacement,
			language,
			timezone,
			twoFactor,
            sessionTimeout,
		} = req.body;

		const updates = {};
		const uploadedProfilePicture = req.files?.profilePicture?.[0]?.path;
		const uploadedCompanyLogo = req.files?.companyLogo?.[0]?.path;

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

		if (typeof companyName === "string" && companyName.trim()) {
			updates.companyName = companyName.trim();
		}

		if (typeof primaryColor === "string" && HEX_COLOR_PATTERN.test(primaryColor.trim())) {
			updates.primaryColor = primaryColor.trim();
		}

		if (typeof accentColor === "string" && HEX_COLOR_PATTERN.test(accentColor.trim())) {
			updates.accentColor = accentColor.trim();
		}

		if (typeof sidebarPlacement === "string" && ["left", "right"].includes(sidebarPlacement)) {
			updates.sidebarPlacement = sidebarPlacement;
		}

		updates.navbarPlacement = "top";

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

        if (typeof sessionTimeout === "number") {
            updates.sessionTimeout = normalizeSessionTimeout(sessionTimeout);
        } else if (typeof sessionTimeout === "string" && sessionTimeout.trim()) {
            updates.sessionTimeout = normalizeSessionTimeout(sessionTimeout);
        }

		if (uploadedProfilePicture) {
			updates.profilePicture = uploadedProfilePicture;
		}

		if (uploadedCompanyLogo) {
			updates.companyLogo = uploadedCompanyLogo;
		}

		const currentEmail = req.user.email;
		const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
			new: true,
			runValidators: true,
		}).select("-password");

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

        let accessToken;
        if (Object.prototype.hasOwnProperty.call(updates, "sessionTimeout")) {
            accessToken = jwt.sign(
                { userId: updatedUser._id, role: updatedUser.role },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: `${normalizeSessionTimeout(updatedUser.sessionTimeout)}m` }
            );

            res.cookie("accessToken", accessToken, {
                ...getCookieOptions(),
                maxAge: normalizeSessionTimeout(updatedUser.sessionTimeout) * 60 * 1000,
            });
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

		res.status(200).json({
            ...updatedUser.toObject(),
            ...(accessToken ? { accessToken } : {}),
        });
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
