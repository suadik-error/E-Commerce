import User from "../model/user.model.js";
import Manager from "../model/manager.model.js";
import Agent from "../model/agent.model.js";
import { sendCredentialsEmail, sendCredentialsSms } from "../lib/credential-delivery.js";

const generateRandomPassword = (length = 12) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  let password = "";
  for (let i = 0; i < length; i += 1) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const isUserOwnedByAdmin = async (adminId, userDoc) => {
  if (String(userDoc.createdByAdmin || "") === String(adminId)) return true;

  if (userDoc.role === "manager") {
    const manager = await Manager.findOne({ email: userDoc.email, admin: adminId }).select("_id");
    return Boolean(manager);
  }

  if (userDoc.role === "agent") {
    const managers = await Manager.find({ admin: adminId }).select("_id");
    const managerIds = managers.map((m) => m._id);
    const agent = await Agent.findOne({ email: userDoc.email, manager: { $in: managerIds } }).select("_id");
    return Boolean(agent);
  }

  return false;
};

export const getAllUsers = async (req, res) => {
  try {
    const managers = await Manager.find({ admin: req.user._id }).select("email _id");
    const managerEmails = managers.map((m) => m.email);
    const managerIds = managers.map((m) => m._id);
    const agents = await Agent.find({ manager: { $in: managerIds } }).select("email");
    const agentEmails = agents.map((a) => a.email);

    const users = await User.find({
      $or: [
        { _id: req.user._id },
        { createdByAdmin: req.user._id },
        { email: { $in: managerEmails } },
        { email: { $in: agentEmails } },
      ],
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const agentEmailsInUsers = users.filter((u) => u.role === "agent").map((u) => u.email);
    if (agentEmailsInUsers.length > 0) {
      const agentProfiles = await Agent.find({ email: { $in: agentEmailsInUsers } })
        .select("email manager")
        .populate("manager", "name email")
        .lean();
      const agentProfileMap = new Map(agentProfiles.map((agent) => [agent.email, agent]));
      const enhancedUsers = users.map((user) => {
        if (user.role !== "agent") return user;
        const agentProfile = agentProfileMap.get(user.email);
        return {
          ...user,
          managerId: agentProfile?.manager?._id || agentProfile?.manager || null,
          managerName: agentProfile?.manager?.name || null,
          managerEmail: agentProfile?.manager?.email || null,
        };
      });
      return res.status(200).json(enhancedUsers);
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      phone,
      address,
      governmentId,
      profilePicture,
      location,
      dateOfBirth,
      managerId,
    } = req.body;
    const uploadedProfilePicture = req.file?.path;
    const normalizedRole = String(role || "").trim().toLowerCase();
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!name || !normalizedEmail || !normalizedRole) {
      return res.status(400).json({ message: "name, email and role are required" });
    }

    if (!["user", "manager", "agent", "admin"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (normalizedRole === "manager" && !phone) {
      return res.status(400).json({ message: "phone is required for manager" });
    }

    if (normalizedRole === "agent" && (!phone || !location || !governmentId || !managerId)) {
      return res.status(400).json({
        message: "phone, location, governmentId and managerId are required for agent",
      });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const generatedPassword = generateRandomPassword(12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: generatedPassword,
      role: normalizedRole,
      profilePicture: uploadedProfilePicture || (profilePicture ? String(profilePicture).trim() : ""),
      createdByAdmin: req.user._id,
    });

    try {
      if (normalizedRole === "manager") {
        await Manager.create({
          name: name.trim(),
          email: normalizedEmail,
          phone: String(phone).trim(),
          address,
          governmentId,
          profilePicture: uploadedProfilePicture || profilePicture,
          admin: req.user._id,
        });
      }

      if (normalizedRole === "agent") {
        const manager = await Manager.findOne({ _id: managerId, admin: req.user._id });
        if (!manager) {
          await User.findByIdAndDelete(user._id);
          return res.status(404).json({ message: "Manager not found for agent profile" });
        }

        await Agent.create({
          name: name.trim(),
          email: normalizedEmail,
          phone: String(phone).trim(),
          location: String(location).trim(),
          governmentId: String(governmentId).trim(),
          dateOfBirth: dateOfBirth || undefined,
          address,
          profilePicture: uploadedProfilePicture || profilePicture,
          manager: manager._id,
        });
      }
    } catch (detailError) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: "Failed to create role details", error: detailError.message });
    }

    const [emailDelivery, smsDelivery] = await Promise.all([
      sendCredentialsEmail({
        toEmail: user.email,
        name: user.name,
        password: generatedPassword,
      }),
      sendCredentialsSms({
        toPhone: phone,
        name: user.name,
        email: user.email,
        password: generatedPassword,
      }),
    ]);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      generatedPassword,
      delivery: {
        email: emailDelivery,
        sms: smsDelivery,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, profilePicture, managerId } = req.body;
    const uploadedProfilePicture = req.file?.path;
    const existing = await User.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!(await isUserOwnedByAdmin(req.user._id, existing))) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updates = {};

    if (typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }

    if (typeof email === "string" && email.trim()) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ message: "Another user already uses this email" });
      }
      updates.email = normalizedEmail;
    }

    if (typeof role === "string" && role.trim()) {
      const normalizedRole = role.toLowerCase().trim();
      if (!["user", "manager", "agent", "admin"].includes(normalizedRole)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      updates.role = normalizedRole;
    }

    if (uploadedProfilePicture) {
      updates.profilePicture = uploadedProfilePicture;
    } else if (typeof profilePicture === "string") {
      updates.profilePicture = profilePicture.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (existing.role === "manager") {
      await Manager.findOneAndUpdate(
        { email: existing.email },
        {
          ...(updates.name ? { name: updates.name } : {}),
          ...(updates.email ? { email: updates.email } : {}),
          ...(updates.profilePicture ? { profilePicture: updates.profilePicture } : {}),
          ...(updates.role && updates.role !== "manager" ? { isActive: false } : {}),
        }
      );
    }

    if (existing.role === "agent") {
      await Agent.findOneAndUpdate(
        { email: existing.email },
        {
          ...(updates.name ? { name: updates.name } : {}),
          ...(updates.email ? { email: updates.email } : {}),
          ...(updates.profilePicture ? { profilePicture: updates.profilePicture } : {}),
          ...(updates.role && updates.role !== "agent" ? { isActive: false } : {}),
        }
      );
    }

    const shouldUpdateAgentManager =
      (existing.role === "agent" || updates.role === "agent") &&
      typeof managerId !== "undefined";

    if (shouldUpdateAgentManager) {
      if (!managerId) {
        await Agent.findOneAndUpdate({ email: updates.email || existing.email }, { manager: null });
      } else {
        const manager = await Manager.findOne({ _id: managerId, admin: req.user._id }).select("_id");
        if (!manager) {
          return res.status(404).json({ message: "Manager not found for agent reassignment" });
        }
        await Agent.findOneAndUpdate({ email: updates.email || existing.email }, { manager: manager._id });
      }
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(req.user?._id) === String(id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!(await isUserOwnedByAdmin(req.user._id, userToDelete))) {
      return res.status(403).json({ message: "Access denied" });
    }
    const deletedUser = await User.findByIdAndDelete(id);

    if (deletedUser.role === "manager") {
      await Manager.findOneAndDelete({ email: deletedUser.email });
    }

    if (deletedUser.role === "agent") {
      await Agent.findOneAndDelete({ email: deletedUser.email });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await User.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!["manager", "agent"].includes(existing.role)) {
      return res.status(400).json({ message: "Password reset is supported only for manager and agent accounts" });
    }

    if (!(await isUserOwnedByAdmin(req.user._id, existing))) {
      return res.status(403).json({ message: "Access denied" });
    }

    const generatedPassword = generateRandomPassword(12);
    existing.password = generatedPassword;
    await existing.save();

    let phone = "";
    if (existing.role === "manager") {
      const managerProfile = await Manager.findOne({ email: existing.email }).select("phone");
      phone = managerProfile?.phone || "";
    } else {
      const agentProfile = await Agent.findOne({ email: existing.email }).select("phone");
      phone = agentProfile?.phone || "";
    }

    const [emailDelivery, smsDelivery] = await Promise.all([
      sendCredentialsEmail({
        toEmail: existing.email,
        name: existing.name,
        password: generatedPassword,
      }),
      sendCredentialsSms({
        toPhone: phone,
        name: existing.name,
        email: existing.email,
        password: generatedPassword,
      }),
    ]);

    res.status(200).json({
      message: "Temporary password generated successfully",
      generatedPassword,
      delivery: {
        email: emailDelivery,
        sms: smsDelivery,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password" });
  }
};
