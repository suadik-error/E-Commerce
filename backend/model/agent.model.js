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
        // Government issued ID document
        governmentId: {
            type: String,
            required: true,
        },
        // Personal details
        dateOfBirth: {
            type: Date,
        },
        address: {
            type: String,
        },
        // Link to manager who created this agent
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Manager",
            default: null
        },
        // Status
        isActive: {
            type: Boolean,
            default: true
        },
        // Profile picture
        profilePicture: {
            type: String,
        },
        // Performance metrics
        totalSales: {
            type: Number,
            default: 0
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        // Featured status
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Agent = mongoose.model("Agent", agentSchema);

export default Agent;
