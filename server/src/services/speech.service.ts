import { AssemblyAI } from "assemblyai";
import { config } from "../config/env";

const client = new AssemblyAI({
  apiKey: config.gemini.assemblyAiApiKey || "",
});

export const speechService = {
  transcribeAudio: async (audioBuffer: Buffer): Promise<string> => {
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
    } catch (error) {
      console.error("AssemblyAI Transcription Error:", error);
      throw error;
    }
  },
};
