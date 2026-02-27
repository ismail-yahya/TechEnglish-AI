import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, z } from "zod";

export const validate =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.flatten().fieldErrors,
        });
        return;
      }
      res.status(400).json({ error: "Invalid request data" });
      return;
    }
  };
