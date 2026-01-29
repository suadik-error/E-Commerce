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
        type: Number,
        required: true,
        maxlength: 15,
    },

}, { timestamps: true });

const Manager = mongoose.model("Manager", managerSchema);

export default Manager;