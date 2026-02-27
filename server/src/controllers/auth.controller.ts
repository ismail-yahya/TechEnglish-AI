import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { authService } from "../services/auth.service";

export const authController = {
  async register(req: AuthRequest, res: Response) {
    try {
      const { email, name, password } = req.body;

      if (!email || !name || !password) {
        res
          .status(400)
          .json({ error: "Email, name, and password are required" });
        return;
      }

      if (password.length < 6) {
        res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
        return;
      }

      const result = await authService.register(email, password, name);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const result = await authService.login(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  },

  async getProfile(req: AuthRequest, res: Response) {
    try {
      // req.userId is now a string (UUID) from auth middleware
      const profile = await authService.getProfile(req.userId!);
      res.json(profile);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { name, chosenDomains, currentLevel, speechEnginePreference } =
        req.body;
      const updated = await authService.updateProfile(req.userId!, {
        name,
        chosenDomains,
        currentLevel,
        speechEnginePreference,
      });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
