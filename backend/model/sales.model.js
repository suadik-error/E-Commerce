import mongoose from "mongoose";

const salesSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent",
        default: null
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Manager",
        default: null
    },
    ownerAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
        required: true
    },
    storefrontCompany: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
        default: null,
    },
    customerUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
        default: null,
    },
    checkoutReference: {
        type: String,
        default: "",
        trim: true,
        index: true,
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    customerName: {
        type: String,
        default: "N/A",
    },
    customerPhone: {
        type: String,
    },
    customerAddress: {
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "confirmed", "cancelled"],
        default: "pending"
    },
    salesChannel: {
        type: String,
        enum: ["internal", "storefront"],
        default: "internal",
    },
    productStatus: {
        type: String,
        enum: ["picked", "sold", "returned"],
        default: "picked"
    },
    status: {
        type: String,
        enum: ["active", "completed", "cancelled"],
        default: "active"
    },
    notes: {
        type: String,
    },
    paymentConfirmedByAdmin: {
        type: Boolean,
        default: false
    },
    paymentConfirmedByManager: {
        type: Boolean,
        default: false
    },
    paymentConfirmedAt: {
        type: Date,
    },
    soldAt: {
        type: Date,
        default: null
    },
}, { timestamps: true });

const Sales = mongoose.model("Sales", salesSchema);

export default Sales;
