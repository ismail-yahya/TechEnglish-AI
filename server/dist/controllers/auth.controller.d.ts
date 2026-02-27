import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const authController: {
    register(req: AuthRequest, res: Response): Promise<void>;
    login(req: AuthRequest, res: Response): Promise<void>;
    getProfile(req: AuthRequest, res: Response): Promise<void>;
    updateProfile(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=auth.controller.d.ts.map