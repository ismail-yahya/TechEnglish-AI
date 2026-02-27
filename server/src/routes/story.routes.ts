import { Router } from "express";
import { storyController } from "../controllers/story.controller";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  generateStorySchema,
  translateSchema,
  submitQuizSchema,
  sendChatSchema,
} from "../schemas/story.schema";

const router = Router();

// All story routes require authentication
router.use(authMiddleware);

router.get("/", storyController.getAll);
router.get("/:id", storyController.getById);
router.post(
  "/generate",
  validate(generateStorySchema),
  storyController.generate,
);
router.post("/translate", validate(translateSchema), storyController.translate);

router.post(
  "/:id/quiz",
  validate(submitQuizSchema),
  storyController.submitQuiz,
);
router.post("/:id/chat", validate(sendChatSchema), storyController.sendChat);

export default router;
