import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../model/product.model.js";
import Request from "../model/request.model.js";
import Manager from "../model/manager.model.js";
import Agent from "../model/agent.model.js";

const resolveOwnerAdminId = async (user) => {
    if (user.role === "admin") return user._id;
    if (user.role === "manager") {
        const manager = await Manager.findOne({ email: user.email }).select("admin");
        return manager?.admin || null;
    }
    if (user.role === "agent") {
        const agent = await Agent.findOne({ email: user.email }).select("manager");
        if (!agent) return null;
        const manager = await Manager.findById(agent.manager).select("admin");
        return manager?.admin || null;
    }
    return null;
};

export const getAllProducts = async (req, res) => {
    try {
        const ownerAdmin = await resolveOwnerAdminId(req.user);
        if (!ownerAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }
        const products = await Product.find({ ownerAdmin }).sort({ createdAt: -1 });
        res.json({ products });
    } catch (error) {
        console.log("Error in getAllProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts) {
            return res.json(JSON.parse(featuredProducts));
        }

        // if not in redis, fetch from mongodb
        // .lean() is gonna return a plain javascript object instead of a mongodb document
        // which is good for performance
        featuredProducts = await Product.find({ isFeatured: true }).lean();

        if (!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" });
        }

        // store in redis for future quick access

        await redis.set("featured_products", JSON.stringify(featuredProducts));

        res.json(featuredProducts);
    } catch (error) {
        console.log("Error in getFeaturedProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, brand, description, color, price, quantity, image, category } = req.body;
        const parsedQuantity = Number(quantity);
        const ownerAdmin = await resolveOwnerAdminId(req.user);
        let finalImage = image || "";

        if (!ownerAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
            return res.status(400).json({ message: "Quantity must be a number greater than or equal to 0" });
        }

        if (image) {
            try {
                const cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
                finalImage = cloudinaryResponse?.secure_url || image;
            } catch (uploadError) {
                // Fallback to provided URL/base64 if cloudinary is not configured.
                finalImage = image;
            }
        }

        const product = await Product.create({
            name,
            brand,
            description,
            color,
            price,
            quantity: parsedQuantity,
            image: finalImage,
            category,
            ownerAdmin,
        });

        res.status(201).json(product);
    } catch (error) {
        console.log("Error in createProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const ownerAdmin = await resolveOwnerAdminId(req.user);
        const product = await Product.findOne({ _id: req.params.id, ownerAdmin });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("deleted image from cloduinary");
            } catch (error) {
                console.log("error deleting image from cloduinary", error);
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log("Error in deleteProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, brand, description, color, price, quantity, image, category } = req.body;
        const ownerAdmin = await resolveOwnerAdminId(req.user);

        const existingProduct = await Product.findOne({ _id: id, ownerAdmin });
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        let finalImage = existingProduct.image;
        if (typeof image === "string" && image.trim()) {
            try {
                const cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
                finalImage = cloudinaryResponse?.secure_url || image;
            } catch (uploadError) {
                finalImage = image;
            }
        }

        const parsedQuantity = quantity === undefined ? existingProduct.quantity : Number(quantity);
        if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
            return res.status(400).json({ message: "Quantity must be a number greater than or equal to 0" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            existingProduct._id,
            {
                name,
                brand,
                description,
                color,
                price,
                quantity: parsedQuantity,
                image: finalImage,
                category,
            },
            { new: true, runValidators: true }
        );

        res.json(updatedProduct);
    } catch (error) {
        console.log("Error in updateProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $sample: { size: 4 },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1,
                },
            },
        ]);

        res.json(products);
    } catch (error) {
        console.log("Error in getRecommendedProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const products = await Product.find({ category });
        res.json({ products });
    } catch (error) {
        console.log("Error in getProductsByCategory controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log("Error in toggleFeaturedProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

async function updateFeaturedProductsCache() {
    try {
        // The lean() method  is used to return plain JavaScript objects instead of full Mongoose documents. This can significantly improve performance

        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("error in update cache function");
    }
}

export const sellProductRequest = async (req, res) => {
    const { name, brand, description, color, price, } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    };

    const totalPrice = product.price * quantity;
    
    await Request.create({
        name,
        brand,
        description,
        color,
        price,
    });
    product.quantity -= quantity;
    await product.save();

    res.status(201).json({ message: "Product sold successfully" });
}
