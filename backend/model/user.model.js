import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
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
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"]
    },
    role: {
        type: String,
        enum: ["user", "manager", "agent", "admin"],
        default: "user"
    },
    createdByAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true,
    },
    profilePicture: {
        type: String,
        default: "",
        trim: true,
    },
    notifications: {
        type: Boolean,
        default: true,
    },
    theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "light",
    },
    language: {
        type: String,
        default: "en",
    },
    timezone: {
        type: String,
        default: "UTC",
    },
    twoFactor: {
        type: Boolean,
        default: false,
    },

    barcodeGenerator: {
        barcode: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Barcode"
        }
    }
}, {
    timestamps: true
});




userSchema.pre('save', async function () {
    if(!this.isModified('password')) 
        return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
