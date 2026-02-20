import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
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
        type: Number,
        required: true,
        maxlength: 15,
    },
    address: {
        type: String,
        required: true,
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Manager",
        default: null
    },
    // Worker specific fields
    department: {
        type: String,
        default: "general"
    },
    position: {
        type: String,
        default: "worker"
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Worker = mongoose.model("Worker", workerSchema);

export default Worker;
