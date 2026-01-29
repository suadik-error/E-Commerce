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
        location: {
            type: string,
            required: true,
        },
        document: {
           type: file,
           required: true,
           enum: [
        "application/pdf", "image/jpeg", "image/png"
      ],
        },
       sFeatured: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Agent = mongoose.model("Agent", agentSchema);

export default Agent;