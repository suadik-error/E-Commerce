import express from "express"
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import productRoutes from "./routes/product.route.js";
import userRoutes from "./routes/user.routes.js";
import managerRoutes from "./routes/manager.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import workerRoutes from "./routes/worker.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

dotenv.config();





const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // Vite frontend
  credentials: true,
}));

app.use(cookieParser());


app.use(express.json());

app.use("/api/auth", authRoutes)
app.use("/api", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/notifications", notificationRoutes);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    connectDB();
});

