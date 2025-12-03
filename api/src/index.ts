import "dotenv/config";
import Express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import tripRoutes from "./routes/trips.js";
import aiRoutes from "./routes/ai.js";
import activityRoutes from "./routes/activities.js";
import destinationRoutes from "./routes/destinations.js";

const app = Express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.APP_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(Express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Odysea API is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/destinations", destinationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err: Error, req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
