import AdminForm from "../model/admin.model.js";
import User from "../model/user.model.js";
import Product from "../model/product.model.js";

export const createAdminRequest = async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      country,
      city,
      phone,
      reason,
      preferredPrimaryColor,
      preferredAccentColor,
      preferredSidebarPlacement,
    } = req.body;

    const companyLogo = req.files?.companyLogo?.[0]?.path || "";

    const request = await AdminForm.create({
      user: req.user._id,
      businessName,
      businessType,
      country,
      city,
      phone,
      reason,
      preferredPrimaryColor,
      preferredAccentColor,
      preferredSidebarPlacement,
      preferredNavbarPlacement: "top",
      documents: {
        businessDoc: req.files.businessDoc[0].path,
        ownerId: req.files.ownerId[0].path,
        financeDoc: req.files.financeDoc[0].path,
        companyLogo,
      },
    });

    await User.findByIdAndUpdate(req.user._id, {
      companyName: businessName?.trim?.() || req.user.name,
      ...(companyLogo ? { companyLogo } : {}),
      ...(typeof preferredPrimaryColor === "string" && preferredPrimaryColor.trim()
        ? { primaryColor: preferredPrimaryColor.trim() }
        : {}),
      ...(typeof preferredAccentColor === "string" && preferredAccentColor.trim()
        ? { accentColor: preferredAccentColor.trim() }
        : {}),
      ...(preferredSidebarPlacement === "left" || preferredSidebarPlacement === "right"
        ? { sidebarPlacement: preferredSidebarPlacement }
        : {}),
      navbarPlacement: "top",
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
    const totalOrders = 0;
    const totalRevenue = 0;

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
