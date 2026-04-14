import express from "express";
import { login, logout, signup, refreshToken, getProfile, updateProfile, changePassword, getPublicCompanyProfile, getPublicCompanies } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadProfile } from "../middleware/upload.middleware.js";


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/companies", getPublicCompanies);
router.get("/company-profile", getPublicCompanyProfile);
router.get("/profile", protectRoute, getProfile);
router.post("/profile", protectRoute, getProfile);
router.put(
  "/profile",
  protectRoute,
  uploadProfile.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "companyLogo", maxCount: 1 },
  ]),
  updateProfile
);
router.post("/change-password", protectRoute, changePassword);


export default router;
