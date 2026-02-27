"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.speechService = void 0;
const assemblyai_1 = require("assemblyai");
const env_1 = require("../config/env");
const client = new assemblyai_1.AssemblyAI({
    apiKey: env_1.config.gemini.assemblyAiApiKey || "",
});
exports.speechService = {
    transcribeAudio: async (audioBuffer) => {
        try {
            const transcript = await client.transcripts.transcribe({
                audio: audioBuffer,
                speech_models: ["universal-3-pro"],
                language_code: "en",
            });
            if (transcript.status === "error") {
                throw new Error(transcript.error);
            }
            return transcript.text || "";
        }
        catch (error) {
            console.error("AssemblyAI Transcription Error:", error);
            throw error;
        }
    },
};
//# sourceMappingURL=speech.service.js.map