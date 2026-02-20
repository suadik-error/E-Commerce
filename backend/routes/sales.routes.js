import express from "express";
import { protectRoute, checkRole } from "../middleware/auth.middleware.js";
import { 
    createSale, 
    getAllSales, 
    getSaleById, 
    updateSale, 
    confirmPayment,
    deleteSale,
    getSalesStats
} from "../controllers/sales.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Sales routes
router.post("/", createSale);
router.get("/", getAllSales);
router.get("/stats", getSalesStats);
router.get("/:id", getSaleById);
router.put("/:id", updateSale);
router.put("/:id/confirm-payment", checkRole(["admin"]), confirmPayment);
router.delete("/:id", checkRole(["admin"]), deleteSale);

export default router;
