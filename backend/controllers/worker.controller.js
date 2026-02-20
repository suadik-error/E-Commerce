import Worker from "../model/worker.model.js";
import Manager from "../model/manager.model.js";

// Create a new worker (Manager only)
export const createWorker = async (req, res) => {
    try {
        const { name, email, phone, address, department, position } = req.body;

        // Check if worker already exists
        const existingWorker = await Worker.findOne({ email });
        if (existingWorker) {
            return res.status(400).json({ message: "Worker with this email already exists" });
        }

        // Get the manager who is creating this worker
        const manager = await Manager.findOne({ email: req.user.email });
        if (!manager) {
            return res.status(404).json({ message: "Manager profile not found" });
        }

        // Create worker linked to manager (no login access)
        const worker = await Worker.create({
            name,
            email,
            phone,
            address,
            department: department || "general",
            position: position || "worker",
            manager: manager._id
        });

        res.status(201).json({
            message: "Worker created successfully",
            worker
        });
    } catch (error) {
        console.error("Error creating worker:", error);
        res.status(500).json({ message: "Failed to create worker" });
    }
};

// Get all workers (Manager or Admin)
export const getAllWorkers = async (req, res) => {
    try {
        let workers;
        
        if (req.user.role === "admin") {
            // Admin can see all workers
            workers = await Worker.find().populate("manager", "name email").sort({ createdAt: -1 });
        } else if (req.user.role === "manager") {
            // Manager can see only their workers
            const manager = await Manager.findOne({ email: req.user.email });
            if (!manager) {
                return res.status(404).json({ message: "Manager profile not found" });
            }
            workers = await Worker.find({ manager: manager._id }).sort({ createdAt: -1 });
        } else {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json(workers);
    } catch (error) {
        console.error("Error getting workers:", error);
        res.status(500).json({ message: "Failed to get workers" });
    }
};

// Get single worker by ID
export const getWorkerById = async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id).populate("manager", "name email");
        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }
        res.json(worker);
    } catch (error) {
        console.error("Error getting worker:", error);
        res.status(500).json({ message: "Failed to get worker" });
    }
};

// Update worker
export const updateWorker = async (req, res) => {
    try {
        const { name, phone, address, department, position, isActive, managerId } = req.body;

        const updates = { name, phone, address, department, position, isActive };

        if (req.user.role === "admin" && managerId !== undefined) {
            if (managerId === null || managerId === "") {
                updates.manager = null;
            } else {
                const nextManager = await Manager.findOne({ _id: managerId, admin: req.user._id }).select("_id");
                if (!nextManager) {
                    return res.status(404).json({ message: "Manager not found" });
                }
                updates.manager = nextManager._id;
            }
        }

        const worker = await Worker.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        res.json({
            message: "Worker updated successfully",
            worker
        });
    } catch (error) {
        console.error("Error updating worker:", error);
        res.status(500).json({ message: "Failed to update worker" });
    }
};

// Delete worker (Manager or Admin)
export const deleteWorker = async (req, res) => {
    try {
        const worker = await Worker.findByIdAndDelete(req.params.id);

        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        res.json({ message: "Worker deleted successfully" });
    } catch (error) {
        console.error("Error deleting worker:", error);
        res.status(500).json({ message: "Failed to delete worker" });
    }
};
