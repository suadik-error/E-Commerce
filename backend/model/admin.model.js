import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
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
        location: {
            type: string,
            required: true,
        },
        document: {
           type: file,
           required: true,
           enum: [
        "application/pdf"
      ],
        },
        category: {
            type: String,
            required: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;