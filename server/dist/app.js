"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const story_routes_1 = __importDefault(require("./routes/story.routes"));
const vocabulary_routes_1 = __importDefault(require("./routes/vocabulary.routes"));
const speech_routes_1 = __importDefault(require("./routes/speech.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: env_1.config.clientUrl,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/stories", story_routes_1.default);
app.use("/api/vocabulary", vocabulary_routes_1.default);
app.use("/api/speech", speech_routes_1.default);
// Error handler
app.use(errorHandler_1.errorHandler);
// Start server
app.listen(env_1.config.port, () => {
    console.log(`🚀 Server running on http://localhost:${env_1.config.port}`);
    console.log(`📝 Environment: ${env_1.config.nodeEnv}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map