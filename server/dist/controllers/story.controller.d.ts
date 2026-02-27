import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const storyController: {
    getAll(req: AuthRequest, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<void>;
    generate(req: AuthRequest, res: Response): Promise<void>;
    submitQuiz(req: AuthRequest, res: Response): Promise<void>;
    sendChat(req: AuthRequest, res: Response): Promise<void>;
    translate(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=story.controller.d.ts.map