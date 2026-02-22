import Sales from "../model/sales.model.js";
import Product from "../model/product.model.js";
import Agent from "../model/agent.model.js";
import Manager from "../model/manager.model.js";
import Notification from "../model/notification.model.js";
import User from "../model/user.model.js";

const resolveOwnerAdminId = async (user) => {
    if (user.role === "admin") return user._id;
    if (user.role === "manager") {
        const manager = await Manager.findOne({ email: user.email }).select("admin");
        return manager?.admin || null;
    }
    if (user.role === "agent") {
        const agent = await Agent.findOne({ email: user.email }).select("manager");
        if (agent?.manager) {
            const manager = await Manager.findById(agent.manager).select("admin");
            if (manager?.admin) return manager.admin;
        }
        const agentUser = await User.findOne({ email: user.email, role: "agent" }).select("createdByAdmin");
        return agentUser?.createdByAdmin || null;
    }
    return null;
};

const getSalesScopeQuery = async (user) => {
    if (user.role === "admin") {
        return { ownerAdmin: user._id };
    }

    if (user.role === "manager") {
        const manager = await Manager.findOne({ email: user.email });
        if (!manager) return null;
        return { manager: manager._id, ownerAdmin: manager.admin };
    }

    if (user.role === "agent") {
        const agent = await Agent.findOne({ email: user.email });
        if (!agent) return null;
        const manager = await Manager.findById(agent.manager);
        if (!manager) return null;
        return { agent: agent._id, ownerAdmin: manager.admin };
    }

    return null;
};

const getManagerUserId = async (managerDoc) => {
    if (!managerDoc?.email) return null;
    const managerUser = await User.findOne({ email: managerDoc.email }).select("_id");
    return managerUser?._id || null;
};

const getAgentUserId = async (agentDoc) => {
    if (!agentDoc?.email) return null;
    const agentUser = await User.findOne({ email: agentDoc.email }).select("_id");
    return agentUser?._id || null;
};

const buildActorLabel = async (user) => {
    if (!user) return "System";
    if (user.role === "agent") {
        const agent = await Agent.findOne({ email: user.email }).select("name");
        return `Agent ${agent?.name || user.email}`;
    }
    if (user.role === "manager") {
        const manager = await Manager.findOne({ email: user.email }).select("name");
        return `Manager ${manager?.name || user.email}`;
    }
    if (user.role === "admin") {
        return "Admin";
    }
    return "User";
};

// Create a new sale (Agent, Manager, or Admin)
export const createSale = async (req, res) => {
    try {
        const { productId, quantity, customerName, customerPhone, customerAddress, notes, markSold } = req.body;
        const requestedQuantity = Number(quantity);
        const ownerAdmin = await resolveOwnerAdminId(req.user);

        // Get the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (!ownerAdmin || String(product.ownerAdmin || "") !== String(ownerAdmin)) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (Number.isNaN(requestedQuantity) || requestedQuantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        if (product.quantity < requestedQuantity) {
            return res.status(400).json({
                message: `Only ${product.quantity} item(s) available in stock`,
            });
        }

        // Calculate total price
        const finalUnitPrice = Number(product.price);
        const totalPrice = finalUnitPrice * requestedQuantity;

        // Get the agent (if agent is making the sale)
        let agent = null;
        let manager = null;

        if (req.user.role === "agent") {
            agent = await Agent.findOne({ email: req.user.email });
            if (!agent) {
                return res.status(404).json({ message: "Agent profile not found" });
            }
            manager = agent.manager ? await Manager.findById(agent.manager) : null;
        } else if (req.user.role === "manager") {
            manager = await Manager.findOne({ email: req.user.email });
            if (!manager) {
                return res.status(404).json({ message: "Manager profile not found" });
            }
        } else if (req.user.role === "admin") {
            // Admin can create sale without agent
        }

        // Create the sale
        const finalOwnerAdmin = manager ? manager.admin : ownerAdmin || req.user._id;
        const shouldMarkSold = String(markSold).toLowerCase() === "true";
        const initialProductStatus = shouldMarkSold ? "sold" : "picked";
        const initialPaymentStatus = "pending";
        const soldAt = shouldMarkSold ? new Date() : null;

        const sale = await Sales.create({
            product: productId,
            agent: agent ? agent._id : null,
            manager: manager ? manager._id : null,
            ownerAdmin: finalOwnerAdmin,
            quantity: requestedQuantity,
            unitPrice: finalUnitPrice,
            totalPrice,
            customerName: customerName || "N/A",
            customerPhone: customerPhone || "",
            customerAddress: customerAddress || "",
            notes,
            productStatus: initialProductStatus,
            paymentStatus: initialPaymentStatus,
            soldAt,
        });

        // Reserve stock at pick/sell time
        product.quantity -= requestedQuantity;
        await product.save();

        if (shouldMarkSold && agent) {
            await Agent.findByIdAndUpdate(agent._id, {
                $inc: { totalSales: 1, totalRevenue: totalPrice }
            });
        }

        // Notify manager
        if (manager) {
            const managerUserId = await getManagerUserId(manager);
            if (managerUserId) {
            await Notification.create({
                recipient: managerUserId,
                recipientRole: "manager",
                type: "product_picked",
                title: "Product Picked",
                message: `Product ${product.name} has been picked by agent ${agent ? agent.name : 'Admin'}`,
                reference: {
                    model: "Sales",
                    id: sale._id
                }
            });
            }
        }

        // Also notify admin
        const adminUser = await User.findById(ownerAdmin);
        if (adminUser) {
            await Notification.create({
                recipient: adminUser._id,
                recipientRole: "admin",
                type: "product_picked",
                title: "Product Picked",
                message: `Product ${product.name} has been picked`,
                reference: {
                    model: "Sales",
                    id: sale._id
                }
            });
        }

        res.status(201).json({
            message: "Sale created successfully",
            sale
        });
    } catch (error) {
        console.error("Error creating sale:", error);
        res.status(500).json({ message: "Failed to create sale" });
    }
};

// Get all sales (Admin, Manager, Agent)
export const getAllSales = async (req, res) => {
    try {
        const scopeQuery = await getSalesScopeQuery(req.user);
        if (!scopeQuery) {
            return res.status(403).json({ message: "Access denied" });
        }

        const sales = await Sales.find(scopeQuery)
            .populate("product", "name brand price quantity")
            .populate("agent", "name email")
            .populate("manager", "name email")
            .sort({ createdAt: -1 });

        res.json(sales);
    } catch (error) {
        console.error("Error getting sales:", error);
        res.status(500).json({ message: "Failed to get sales" });
    }
};

// Get single sale by ID
export const getSaleById = async (req, res) => {
    try {
        const scopeQuery = await getSalesScopeQuery(req.user);
        if (!scopeQuery) {
            return res.status(403).json({ message: "Access denied" });
        }

        const sale = await Sales.findOne({ _id: req.params.id, ...scopeQuery })
            .populate("product", "name brand price")
            .populate("agent", "name email")
            .populate("manager", "name email");

        if (!sale) {
            return res.status(404).json({ message: "Sale not found" });
        }

        res.json(sale);
    } catch (error) {
        console.error("Error getting sale:", error);
        res.status(500).json({ message: "Failed to get sale" });
    }
};

// Update sale (confirm product sold, payment received, etc.)
export const updateSale = async (req, res) => {
    try {
        const { productStatus, paymentStatus, notes, soldQuantity } = req.body;
        const scopeQuery = await getSalesScopeQuery(req.user);
        if (!scopeQuery) {
            return res.status(403).json({ message: "Access denied" });
        }

        const sale = await Sales.findOne({ _id: req.params.id, ...scopeQuery })
            .populate("product")
            .populate("agent");

        if (!sale) {
            return res.status(404).json({ message: "Sale not found" });
        }

        const previousProductStatus = sale.productStatus;

        // Update fields
        if (productStatus) sale.productStatus = productStatus;
        if (paymentStatus) sale.paymentStatus = paymentStatus;
        if (notes) sale.notes = notes;

        // If payment is confirmed
        if (paymentStatus === "paid") {
            sale.paymentConfirmedByManager = true;
            sale.paymentConfirmedAt = new Date();

            const actorLabel = await buildActorLabel(req.user);
            const notifications = [];

            // Notify the owner admin for this specific sale.
            const ownerAdminUser = await User.findById(sale.ownerAdmin).select("_id");
            if (ownerAdminUser && String(ownerAdminUser._id) !== String(req.user._id)) {
                notifications.push({
                    recipient: ownerAdminUser._id,
                    recipientRole: "admin",
                    type: "payment_received",
                    title: "Payment Received",
                    message: `${actorLabel} recorded payment of $${sale.totalPrice} for product ${sale.product.name}`,
                    reference: {
                        model: "Sales",
                        id: sale._id
                    },
                    sender: req.user._id,
                });
            }

            // Notify manager if this sale has a manager and actor is not the manager user.
            if (sale.manager) {
                const managerDoc = await Manager.findById(sale.manager);
                const managerUserId = await getManagerUserId(managerDoc);
                if (managerUserId && String(managerUserId) !== String(req.user._id)) {
                    notifications.push({
                        recipient: managerUserId,
                        recipientRole: "manager",
                        type: "payment_received",
                        title: "Payment Received",
                        message: `${actorLabel} recorded payment of $${sale.totalPrice} for product ${sale.product.name}`,
                        reference: {
                            model: "Sales",
                            id: sale._id
                        },
                        sender: req.user._id,
                    });
                }
            }

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        }

        // If product is sold
        if (productStatus === "sold") {
            const parsedSoldQuantity = soldQuantity === undefined ? sale.quantity : Number(soldQuantity);

            if (Number.isNaN(parsedSoldQuantity) || parsedSoldQuantity < 1) {
                return res.status(400).json({ message: "soldQuantity must be at least 1" });
            }

            if (parsedSoldQuantity > sale.quantity) {
                return res.status(400).json({ message: "soldQuantity cannot exceed picked quantity" });
            }

            // Partial sale: split picked record into sold + remaining picked quantity.
            if (parsedSoldQuantity < sale.quantity) {
                const soldTotalPrice = Number(sale.unitPrice) * parsedSoldQuantity;
                const remainingQuantity = sale.quantity - parsedSoldQuantity;

                const soldSale = await Sales.create({
                    product: sale.product._id,
                    agent: sale.agent ? sale.agent._id : null,
                    manager: sale.manager || null,
                    ownerAdmin: sale.ownerAdmin,
                    quantity: parsedSoldQuantity,
                    unitPrice: sale.unitPrice,
                    totalPrice: soldTotalPrice,
                    customerName: sale.customerName,
                    customerPhone: sale.customerPhone,
                    customerAddress: sale.customerAddress,
                    notes: notes || sale.notes,
                    paymentStatus: sale.paymentStatus,
                    productStatus: "sold",
                    soldAt: new Date(),
                });

                sale.quantity = remainingQuantity;
                sale.totalPrice = Number(sale.unitPrice) * remainingQuantity;
                sale.productStatus = "picked";
                await sale.save();

                if (sale.agent) {
                    await Agent.findByIdAndUpdate(sale.agent._id, {
                        $inc: { totalSales: 1, totalRevenue: soldSale.totalPrice }
                    });
                }

                return res.json({
                    message: "Partial quantity marked as sold successfully",
                    sale: soldSale,
                    remainingPick: sale,
                });
            }

            if (previousProductStatus !== "sold") {
                sale.soldAt = new Date();
            }

            // Update agent performance
            if (sale.agent) {
                await Agent.findByIdAndUpdate(sale.agent._id, {
                    $inc: { totalSales: 1, totalRevenue: sale.totalPrice }
                });

                // Notify manager
                const manager = await Manager.findById(sale.manager);
                if (manager) {
                    const managerUserId = await getManagerUserId(manager);
                    if (managerUserId) {
                    await Notification.create({
                        recipient: managerUserId,
                        recipientRole: "manager",
                        type: "product_sold",
                        title: "Product Sold",
                        message: `Product ${sale.product.name} has been sold by agent ${sale.agent.name}`,
                        reference: {
                            model: "Sales",
                            id: sale._id
                        }
                    });
                    }
                }
            }
        }

        // If product is returned
        if (productStatus === "returned") {
            sale.soldAt = null;
            if (previousProductStatus !== "returned" && sale.product) {
                await Product.findByIdAndUpdate(sale.product._id, {
                    $inc: { quantity: sale.quantity },
                });
            }

            // Notify manager
            const manager = await Manager.findById(sale.manager);
            if (manager) {
                const managerUserId = await getManagerUserId(manager);
                if (managerUserId) {
                await Notification.create({
                    recipient: managerUserId,
                    recipientRole: "manager",
                    type: "product_returned",
                    title: "Product Returned",
                    message: `Product ${sale.product.name} has been returned`,
                    reference: {
                        model: "Sales",
                        id: sale._id
                    }
                });
                }
            }
        }

        await sale.save();

        res.json({
            message: "Sale updated successfully",
            sale
        });
    } catch (error) {
        console.error("Error updating sale:", error);
        res.status(500).json({ message: "Failed to update sale" });
    }
};

// Confirm payment (Admin only)
export const confirmPayment = async (req, res) => {
    try {
        const sale = await Sales.findById(req.params.id)
            .populate("product")
            .populate("agent")
            .populate("manager");

        if (!sale) {
            return res.status(404).json({ message: "Sale not found" });
        }

        if (sale.paymentStatus === "confirmed") {
            return res.status(400).json({ message: "Payment already confirmed" });
        }

        sale.paymentStatus = "confirmed";
        sale.paymentConfirmedByAdmin = true;
        sale.paymentConfirmedAt = new Date();
        await sale.save();

        // Notify manager
        if (sale.manager) {
            const managerUserId = await getManagerUserId(sale.manager);
            if (managerUserId) {
            await Notification.create({
                recipient: managerUserId,
                recipientRole: "manager",
                type: "payment_confirmed",
                title: "Payment Confirmed",
                message: `Payment of $${sale.totalPrice} for product ${sale.product.name} has been confirmed by admin`,
                reference: {
                    model: "Sales",
                    id: sale._id
                }
            });
            }
        }

        // Notify agent
        if (sale.agent) {
            const agentUserId = await getAgentUserId(sale.agent);
            if (agentUserId) {
            await Notification.create({
                recipient: agentUserId,
                recipientRole: "agent",
                type: "payment_confirmed",
                title: "Payment Confirmed",
                message: `Payment of $${sale.totalPrice} for product ${sale.product.name} has been confirmed by admin`,
                reference: {
                    model: "Sales",
                    id: sale._id
                }
            });
            }
        }

        res.json({
            message: "Payment confirmed successfully",
            sale
        });
    } catch (error) {
        console.error("Error confirming payment:", error);
        res.status(500).json({ message: "Failed to confirm payment" });
    }
};

// Delete sale (Admin only)
export const deleteSale = async (req, res) => {
    try {
        const sale = await Sales.findOneAndDelete({ _id: req.params.id, ownerAdmin: req.user._id });

        if (!sale) {
            return res.status(404).json({ message: "Sale not found" });
        }

        res.json({ message: "Sale deleted successfully" });
    } catch (error) {
        console.error("Error deleting sale:", error);
        res.status(500).json({ message: "Failed to delete sale" });
    }
};

// Get sales statistics
export const getSalesStats = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === "admin") {
            query.ownerAdmin = req.user._id;
        } else if (req.user.role === "manager") {
            const manager = await Manager.findOne({ email: req.user.email });
            if (manager) {
                query.manager = manager._id;
                query.ownerAdmin = manager.admin;
            }
        } else if (req.user.role === "agent") {
            const agent = await Agent.findOne({ email: req.user.email });
            if (agent) {
                query.agent = agent._id;
                const manager = await Manager.findById(agent.manager).select("admin");
                if (manager) query.ownerAdmin = manager.admin;
            }
        }

        const totalSales = await Sales.countDocuments({ ...query, productStatus: "sold" });
        const totalRevenue = await Sales.aggregate([
            { $match: { ...query, productStatus: "sold", paymentStatus: "confirmed" } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        const pendingPayments = await Sales.countDocuments({ ...query, paymentStatus: "pending" });
        const totalOrders = await Sales.countDocuments(query);

        res.json({
            totalSales,
            totalRevenue: totalRevenue[0]?.total || 0,
            pendingPayments,
            totalOrders
        });
    } catch (error) {
        console.error("Error getting sales stats:", error);
        res.status(500).json({ message: "Failed to get sales stats" });
    }
};
