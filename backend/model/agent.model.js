import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        governmentId: {
            type: String,
            required: true,
        },
        dateOfBirth: {
            type: Date,
        },
        address: {
            type: String,
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Manager",
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        },
        profilePicture: {
            type: String,
        },
        totalSales: {
            type: Number,
            default: 0
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Agent = mongoose.model("Agent", agentSchema);

export default Agent;
