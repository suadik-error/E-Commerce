import express from "express";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getFeaturedProducts,
    getProductsByCategory,
    getRecommendedProducts,
    toggleFeaturedProduct,
    sellProductRequest,
    updateProduct,
} from "../controllers/product.controller.js";
import { checkRole, protectRoute } from "../middleware/auth.middleware.js";
import { uploadProduct } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", protectRoute, checkRole(["admin", "manager", "agent"]), getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", protectRoute, checkRole(["admin", "manager"]), uploadProduct.single("image"), createProduct);
router.post("/:id", protectRoute, checkRole(["admin", "manager"]), sellProductRequest);
router.put("/:id", protectRoute, checkRole(["admin", "manager"]), uploadProduct.single("image"), updateProduct);
router.patch("/:id", protectRoute, checkRole(["admin"]), toggleFeaturedProduct);
router.delete("/:id", protectRoute, checkRole(["admin", "manager"]), deleteProduct);

export default router;
