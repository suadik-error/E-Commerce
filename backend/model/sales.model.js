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
    // Payment status: pending, paid, confirmed
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "confirmed", "cancelled"],
        default: "pending"
    },
    // Product status: picked, sold, returned
    productStatus: {
        type: String,
        enum: ["picked", "sold", "returned"],
        default: "picked"
    },
    // Sales status: active, completed
    status: {
        type: String,
        enum: ["active", "completed", "cancelled"],
        default: "active"
    },
    notes: {
        type: String,
    },
    // Payment confirmed by admin
    paymentConfirmedByAdmin: {
        type: Boolean,
        default: false
    },
    // Payment confirmed by manager
    paymentConfirmedByManager: {
        type: Boolean,
        default: false
    },
    // Date when payment was confirmed
    paymentConfirmedAt: {
        type: Date,
    },
    // Date/time when item was marked as sold
    soldAt: {
        type: Date,
        default: null
    },
}, { timestamps: true });

const Sales = mongoose.model("Sales", salesSchema);

export default Sales;
