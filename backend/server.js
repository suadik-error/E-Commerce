import express from "express"
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configuredOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map((origin) => origin.trim())
  .filter(Boolean);

const localhostOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
]);

const vercelPreviewSuffixes = configuredOrigins
  .map((origin) => {
    try {
      const { hostname } = new URL(origin);

      if (!hostname.endsWith(".vercel.app")) {
        return null;
      }

      const parts = hostname.split(".");
      if (parts.length < 3) {
        return null;
      }

      const labels = parts[0].split("-");
      if (labels.length < 2) {
        return null;
      }

      return `-${labels.slice(1).join("-")}.vercel.app`;
    } catch {
      return null;
    }
  })
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (localhostOrigins.has(origin) || configuredOrigins.includes(origin)) {
    return true;
  }

  try {
    const { hostname, protocol } = new URL(origin);

    if (protocol !== "https:") {
      return false;
    }

    return vercelPreviewSuffixes.some((suffix) => hostname.endsWith(suffix));
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    if (configuredOrigins.length === 0 || isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    connectDB();
});
