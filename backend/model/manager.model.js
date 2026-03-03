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
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    profilePicture: {
        type: String,
    },
    governmentId: {
        type: String,
    },
}, { timestamps: true });

const Manager = mongoose.model("Manager", managerSchema);

export default Manager;
