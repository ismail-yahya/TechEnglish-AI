"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const story_controller_1 = require("../controllers/story.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All story routes require authentication
router.use(auth_1.authMiddleware);
router.get("/", story_controller_1.storyController.getAll);
router.get("/:id", story_controller_1.storyController.getById);
router.post("/generate", story_controller_1.storyController.generate);
router.post("/translate", story_controller_1.storyController.translate);
router.post("/:id/quiz", story_controller_1.storyController.submitQuiz);
router.post("/:id/chat", story_controller_1.storyController.sendChat);
exports.default = router;
//# sourceMappingURL=story.routes.js.map