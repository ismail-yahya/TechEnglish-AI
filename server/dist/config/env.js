"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || "5000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    jwt: {
        secret: process.env.JWT_SECRET || "fallback-secret-change-this",
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || "",
        googleTranslateApiKey: process.env.GOOGLE_TRANSLATE_API_KEY || "",
        assemblyAiApiKey: process.env.ASSEMBLYAI_API_KEY || "",
    },
};
//# sourceMappingURL=env.js.map