import express from "express"
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";

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


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    connectDB();
});

