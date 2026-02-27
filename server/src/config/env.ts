import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((s) => s.trim())
    : ["http://localhost:5173"],
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
