import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getUserPayments, 
  recordPayment 
} from "../controllers/payment.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getUserPayments);
router.post("/", recordPayment);

export default router;

