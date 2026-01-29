import express from "express"
import dotenv from "dotenv";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.routes.js";   

dotenv.config();




const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use("/api/auth", authRoutes)


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${PORT}`)
    connectDB();
});

