"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storyController = void 0;
const story_service_1 = require("../services/story.service");
exports.storyController = {
    async getAll(req, res) {
        try {
            const stories = await story_service_1.storyService.getAllByUser(req.userId);
            res.json(stories);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getById(req, res) {
        try {
            const storyId = req.params.id;
            if (typeof storyId !== "string") {
                res.status(400).json({ error: "Invalid ID format" });
                return;
            }
            const story = await story_service_1.storyService.getById(storyId, req.userId);
            res.json(story);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    },
    async generate(req, res) {
        try {
            const { domain } = req.body;
            if (!domain) {
                res.status(400).json({ error: "Domain is required" });
                return;
            }
            const story = await story_service_1.storyService.generate(req.userId, domain);
            res.status(201).json(story);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async submitQuiz(req, res) {
        try {
            const storyId = req.params.id;
            if (typeof storyId !== "string") {
                res.status(400).json({ error: "Invalid ID format" });
                return;
            }
            const { answers } = req.body;
            if (!answers || !Array.isArray(answers)) {
                res.status(400).json({ error: "Answers array is required" });
                return;
            }
            const result = await story_service_1.storyService.submitQuizAnswers(storyId, req.userId, answers);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async sendChat(req, res) {
        try {
            const storyId = req.params.id;
            if (typeof storyId !== "string") {
                res.status(400).json({ error: "Invalid ID format" });
                return;
            }
            const { message } = req.body;
            if (!message) {
                res.status(400).json({ error: "Message is required" });
                return;
            }
            const aiResponse = await story_service_1.storyService.sendChatMessage(storyId, req.userId, message);
            res.json(aiResponse);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async translate(req, res) {
        try {
            const { text } = req.body;
            if (!text) {
                res.status(400).json({ error: "Text is required" });
                return;
            }
            const translation = await story_service_1.storyService.translate(text);
            res.json({ original: text, translation });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
//# sourceMappingURL=story.controller.js.map