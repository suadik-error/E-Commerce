import mongoose from "mongoose";

const managerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
        maxlength: 15,
    },
    address: {
        type: String,
    },
    // Link to the admin who created this manager
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
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
    // Government issued ID
    governmentId: {
        type: String,
    },
}, { timestamps: true });

const Manager = mongoose.model("Manager", managerSchema);

export default Manager;
