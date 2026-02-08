import AdminForm from "../model/admin.model.js";

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
