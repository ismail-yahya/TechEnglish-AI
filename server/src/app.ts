import express from "express";
import cors from "cors";
import { config } from "./config/env";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import storyRoutes from "./routes/story.routes";
import vocabularyRoutes from "./routes/vocabulary.routes";
import speechRoutes from "./routes/speech.routes";

const app = express();

// CORS — must be FIRST to handle preflight OPTIONS before other middleware
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/api/speech", speechRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
});

export default app;
