import mongoose from "mongoose";

const adminFormSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    businessName: String,
    businessType: String,
    country: String,
    city: String,
    phone: String,
    reason: String,

    documents: {
      businessDoc: String,
      ownerId: String,
      financeDoc: String,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("AdminForm", adminFormSchema);
