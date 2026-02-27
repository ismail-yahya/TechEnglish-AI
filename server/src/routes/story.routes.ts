import { Router } from "express";
import { storyController } from "../controllers/story.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All story routes require authentication
router.use(authMiddleware);

router.get("/", storyController.getAll);
router.get("/:id", storyController.getById);
router.post("/generate", storyController.generate);
router.post("/translate", storyController.translate);

router.post("/:id/quiz", storyController.submitQuiz);
router.post("/:id/chat", storyController.sendChat);

export default router;
