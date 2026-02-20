import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // Role-based notification: admin, manager, agent
    recipientRole: {
        type: String,
        enum: ["admin", "manager", "agent"],
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    type: {
        type: String,
        enum: [
            "payment_received", 
            "payment_confirmed", 
            "product_sold", 
            "product_returned", 
            "product_picked",
            "new_agent",
            "new_manager",
            "new_worker",
            "sales_made",
            "alert"
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    // Reference to related document
    reference: {
        model: {
            type: String,
            enum: ["Sales", "Product", "Agent", "Manager", "Worker"]
        },
        id: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    // Priority: low, normal, high
    priority: {
        type: String,
        enum: ["low", "normal", "high"],
        default: "normal"
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
