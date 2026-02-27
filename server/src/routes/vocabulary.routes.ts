import { Router } from "express";
import { vocabularyController } from "../controllers/vocabulary.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All vocabulary routes require authentication
router.use(authMiddleware);

router.get("/learning", vocabularyController.getLearning);
router.get("/known", vocabularyController.getKnown);
router.get("/stats", vocabularyController.getStats);
router.post("/add", vocabularyController.addWord);
router.post("/add-bulk", vocabularyController.addWordsFromStory);
router.get("/practice", vocabularyController.getPracticeSession);
router.post("/generate-words", vocabularyController.generateNewWords);
router.post("/:wordId/exercise", vocabularyController.generateExercise);
router.post("/:wordId/result", vocabularyController.recordResult);

export default router;
