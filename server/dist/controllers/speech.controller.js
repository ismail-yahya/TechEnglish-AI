"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribeAudio = void 0;
const speech_service_1 = require("../services/speech.service");
const transcribeAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided" });
        }
        // Pass the buffer directly to the service
        const transcript = await speech_service_1.speechService.transcribeAudio(req.file.buffer);
        res.json({ transcript });
    }
    catch (error) {
        console.error("Transcribe API Error:", error);
        res.status(500).json({ error: "Transcription failed" });
    }
};
exports.transcribeAudio = transcribeAudio;
//# sourceMappingURL=speech.controller.js.map