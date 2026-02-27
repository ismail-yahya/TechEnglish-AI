"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vocabulary_controller_1 = require("../controllers/vocabulary.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All vocabulary routes require authentication
router.use(auth_1.authMiddleware);
router.get("/learning", vocabulary_controller_1.vocabularyController.getLearning);
router.get("/known", vocabulary_controller_1.vocabularyController.getKnown);
router.get("/stats", vocabulary_controller_1.vocabularyController.getStats);
router.post("/add", vocabulary_controller_1.vocabularyController.addWord);
router.post("/add-bulk", vocabulary_controller_1.vocabularyController.addWordsFromStory);
router.get("/practice", vocabulary_controller_1.vocabularyController.getPracticeSession);
router.post("/generate-words", vocabulary_controller_1.vocabularyController.generateNewWords);
router.post("/:wordId/exercise", vocabulary_controller_1.vocabularyController.generateExercise);
router.post("/:wordId/result", vocabulary_controller_1.vocabularyController.recordResult);
exports.default = router;
//# sourceMappingURL=vocabulary.routes.js.map