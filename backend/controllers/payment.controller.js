import Payment from "../model/payment.model.js";

export const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ date: -1 })
      .populate("user", "name email");

    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

export const recordPayment = async (req, res) => {
  try {
    const { amount, status = "Completed", description } = req.body;

    const payment = await Payment.create({
      user: req.user._id,
      amount,
      status,
      description: description || "Credit/Debit card payment"
    });

    res.status(201).json({
      message: "Payment recorded successfully",
      payment
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({ message: "Failed to record payment" });
  }
};

