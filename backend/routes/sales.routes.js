import express from "express";
import { protectRoute, checkRole } from "../middleware/auth.middleware.js";
import { 
    createSale, 
    createStorefrontOrder,
    createPaymentIntent,
    getAllSales, 
    getSaleById, 
    getMyStorefrontOrders,
    updateSale, 
    updateDeliveryStatus,
    confirmPayment,
    deleteSale,
    getSalesStats
} from "../controllers/sales.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/checkout", createStorefrontOrder);
router.post("/payment-intent", createPaymentIntent);
router.get("/mine", getMyStorefrontOrders);
router.post("/", createSale);
router.get("/", getAllSales);
router.get("/stats", getSalesStats);
router.get("/:id", getSaleById);
router.put("/:id", updateSale);
router.put("/:id/delivery-status", updateDeliveryStatus);
router.put("/:id/confirm-payment", checkRole(["admin"]), confirmPayment);
router.delete("/:id", checkRole(["admin"]), deleteSale);

export default router;
