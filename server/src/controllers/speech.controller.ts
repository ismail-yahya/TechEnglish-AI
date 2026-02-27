import { Request, Response } from "express";
import { speechService } from "../services/speech.service";

export const transcribeAudio = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    // Pass the buffer directly to the service
    const transcript = await speechService.transcribeAudio(req.file.buffer);

    res.json({ transcript });
  } catch (error) {
    console.error("Transcribe API Error:", error);
    res.status(500).json({ error: "Transcription failed" });
  }
};
