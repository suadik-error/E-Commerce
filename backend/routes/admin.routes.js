import express from "express";
import upload from "../middleware/upload.middleware.js";
import { protectRoute as protect } from "../middleware/auth.middleware.js";
import { createAdminRequest } from "../controllers/admin.controller.js";

const router = express.Router();

router.post(
  "/admin-request",
  protect,
  upload.fields([
    { name: "businessDoc", maxCount: 1 },
    { name: "ownerId", maxCount: 1 },
    { name: "financeDoc", maxCount: 1 },
  ]),
  createAdminRequest
);

export default router;
