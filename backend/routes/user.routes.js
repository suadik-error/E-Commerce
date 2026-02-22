import express from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword
} from "../controllers/user.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { uploadProfile } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllUsers);
router.post("/", protectRoute, adminRoute, uploadProfile.single("profilePicture"), createUser);
router.put("/:id", protectRoute, adminRoute, uploadProfile.single("profilePicture"), updateUser);
router.post("/:id/reset-password", protectRoute, adminRoute, resetUserPassword);
router.delete("/:id", protectRoute, adminRoute, deleteUser);

export default router;
