import AdminForm from "../model/admin.model.js";
import User from "../model/user.model.js";
import Product from "../model/product.model.js";

export const createAdminRequest = async (req, res) => {
  try {
    const { businessName, businessType, country, city, phone, reason } = req.body;

    const request = await AdminForm.create({
      user: req.user._id,
      businessName,
      businessType,
      country,
      city,
      phone,
      reason,
      documents: {
        businessDoc: req.files.businessDoc[0].path,
        ownerId: req.files.ownerId[0].path,
        financeDoc: req.files.financeDoc[0].path,
      },
    });

    res.status(201).json({
      message: "Admin request submitted successfully",
      request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Submission failed" });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    // Assuming no orders model yet, set to 0 or calculate from requests if applicable
    const totalOrders = 0; // Placeholder, update when orders are implemented
    const totalRevenue = 0; // Placeholder, calculate from orders

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
