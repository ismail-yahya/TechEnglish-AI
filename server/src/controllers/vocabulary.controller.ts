import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { vocabularyService } from "../services/vocabulary.service";

export const vocabularyController = {
  async getLearning(req: AuthRequest, res: Response) {
    try {
      const words = await vocabularyService.getLearning(req.userId!);
      res.json(words);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getKnown(req: AuthRequest, res: Response) {
    try {
      const words = await vocabularyService.getKnown(req.userId!);
      res.json(words);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getStats(req: AuthRequest, res: Response) {
    try {
      const stats = await vocabularyService.getStats(req.userId!);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async addWord(req: AuthRequest, res: Response) {
    try {
      const { word, translation, level, domain } = req.body;
      if (!word || !translation) {
        res.status(400).json({ error: "Word and translation are required" });
        return;
      }

      const vocab = await vocabularyService.addWord(
        req.userId!,
        word,
        translation,
        level || "A0",
        domain || "General Tech",
        (req.body.masteryStatus as string) || "learning",
      );
      res.status(201).json(vocab);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async addWordsFromStory(req: AuthRequest, res: Response) {
    try {
      const { words, level, domain } = req.body;
      if (!words || !Array.isArray(words)) {
        res.status(400).json({ error: "Words array is required" });
        return;
      }

      const added = await vocabularyService.addWordsFromStory(
        req.userId!,
        words,
        level || "A0",
        domain || "General Tech",
      );
      res.json({ added: added.length, words: added });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getPracticeSession(req: AuthRequest, res: Response) {
    try {
      const words = await vocabularyService.getPracticeSession(req.userId!);
      res.json(words);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async generateExercise(req: AuthRequest, res: Response) {
    try {
      const wordId = req.params.wordId as string;
      if (typeof wordId !== "string") {
        res.status(400).json({ error: "Invalid ID format" });
        return;
      }
      const { skill } = req.body;

      if (!skill) {
        res.status(400).json({ error: "Skill type is required" });
        return;
      }

      const exercise = await vocabularyService.generateExercise(
        req.userId!,
        wordId,
        skill,
      );
      res.json(exercise);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async recordResult(req: AuthRequest, res: Response) {
    try {
      const wordId = req.params.wordId as string;
      if (typeof wordId !== "string") {
        res.status(400).json({ error: "Invalid ID format" });
        return;
      }
      const { skill, isCorrect } = req.body;

      if (!skill || typeof isCorrect !== "boolean") {
        res.status(400).json({ error: "Skill and isCorrect are required" });
        return;
      }

      const result = await vocabularyService.recordPracticeResult(
        req.userId!,
        wordId,
        skill,
        isCorrect,
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async generateNewWords(req: AuthRequest, res: Response) {
    try {
      const count = parseInt(req.query.count as string) || 10;
      const words = await vocabularyService.generateNewWords(
        req.userId!,
        count,
      );
      res.json(words);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
