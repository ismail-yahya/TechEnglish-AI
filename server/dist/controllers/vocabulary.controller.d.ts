import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const vocabularyController: {
    getLearning(req: AuthRequest, res: Response): Promise<void>;
    getKnown(req: AuthRequest, res: Response): Promise<void>;
    getStats(req: AuthRequest, res: Response): Promise<void>;
    addWord(req: AuthRequest, res: Response): Promise<void>;
    addWordsFromStory(req: AuthRequest, res: Response): Promise<void>;
    getPracticeSession(req: AuthRequest, res: Response): Promise<void>;
    generateExercise(req: AuthRequest, res: Response): Promise<void>;
    recordResult(req: AuthRequest, res: Response): Promise<void>;
    generateNewWords(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=vocabulary.controller.d.ts.map