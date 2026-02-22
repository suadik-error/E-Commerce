import express from "express";
import { login, logout, signup, refreshToken, getProfile, updateProfile, changePassword } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadProfile } from "../middleware/upload.middleware.js";


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.post("/profile", protectRoute, getProfile);
router.put("/profile", protectRoute, uploadProfile.single("profilePicture"), updateProfile);
router.post("/change-password", protectRoute, changePassword);


export default router;
