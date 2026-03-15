import { createServer } from 'http';
import { parse } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Import and use all routes
import authRoutes from '../backend/routes/auth.routes.js';
import adminRoutes from '../backend/routes/admin.routes.js';
import productRoutes from '../backend/routes/product.route.js';
import userRoutes from '../backend/routes/user.routes.js';
import managerRoutes from '../backend/routes/manager.routes.js';
import agentRoutes from '../backend/routes/agent.routes.js';
import workerRoutes from '../backend/routes/worker.routes.js';
import salesRoutes from '../backend/routes/sales.routes.js';
import notificationRoutes from '../backend/routes/notification.routes.js';

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/managers", managerRoutes);
app.use("/agents", agentRoutes);
app.use("/workers", workerRoutes);
app.use("/sales", salesRoutes);
app.use("/notifications", notificationRoutes);

app.get("/healthz", (req, res) => res.status(200).json({ ok: true }));

const handler = (req, res) => {
  app(req, res);
};

export default handler;
