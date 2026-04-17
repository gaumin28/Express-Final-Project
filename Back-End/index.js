import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import productRouter from "./routes/productRoutes.js";

import CustomerRoute from "./routes/customerRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const DATABASE_URL = process.env.DATABASE_URL;
const FRONT_END_ORIGIN =
  process.env.FRONT_END_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: FRONT_END_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "5mb" }));

app.use("/api/products", productRouter);

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/api/auth", CustomerRoute);
app.use("/customers", CustomerRoute);

app.use((req, res) => {
  return res.status(404).json({ error: "Route not found" });
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  return res.status(status).json({
    error: error.message || "Internal server error",
  });
});

mongoose.connection.on("error", (error) => {
  console.error("[MongoDB] Connection error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Disconnected from database");
});

const startServer = async () => {
  try {
    if (!DATABASE_URL) {
      throw new Error("Missing DATABASE_URL in .env");
    }

    await mongoose.connect(DATABASE_URL);
    console.log("[MongoDB] Connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("[Startup] Failed to connect to MongoDB");
    console.error(`[Startup] DATABASE_URL: ${DATABASE_URL || "<empty>"}`);
    console.error(`[Startup] Reason: ${error.message}`);
    process.exit(1);
  }
};

startServer();
