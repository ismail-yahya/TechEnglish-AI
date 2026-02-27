import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { storyService } from "../services/story.service";

export const storyController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const stories = await storyService.getAllByUser(req.userId!);
      res.json(stories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const storyId = req.params.id as string;
      if (typeof storyId !== "string") {
        res.status(400).json({ error: "Invalid ID format" });
        return;
      }
      const story = await storyService.getById(storyId, req.userId!);
      res.json(story);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async generate(req: AuthRequest, res: Response) {
    try {
      const { domain } = req.body;
      if (!domain) {
        res.status(400).json({ error: "Domain is required" });
        return;
      }

      const story = await storyService.generate(req.userId!, domain);
      res.status(201).json(story);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async submitQuiz(req: AuthRequest, res: Response) {
    try {
      const storyId = req.params.id as string;
      if (typeof storyId !== "string") {
        res.status(400).json({ error: "Invalid ID format" });
        return;
      }
      const { answers } = req.body;

      if (!answers || !Array.isArray(answers)) {
        res.status(400).json({ error: "Answers array is required" });
        return;
      }

      const result = await storyService.submitQuizAnswers(
        storyId,
        req.userId!,
        answers,
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async sendChat(req: AuthRequest, res: Response) {
    try {
      const storyId = req.params.id as string;
      if (typeof storyId !== "string") {
        res.status(400).json({ error: "Invalid ID format" });
        return;
      }
      const { message } = req.body;

      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      const aiResponse = await storyService.sendChatMessage(
        storyId,
        req.userId!,
        message,
      );
      res.json(aiResponse);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async translate(req: AuthRequest, res: Response) {
    try {
      const { text } = req.body;
      if (!text) {
        res.status(400).json({ error: "Text is required" });
        return;
      }

      const translation = await storyService.translate(text);
      res.json({ original: text, translation });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
