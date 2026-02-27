"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vocabularyController = void 0;
const vocabulary_service_1 = require("../services/vocabulary.service");
exports.vocabularyController = {
    async getLearning(req, res) {
        try {
            const words = await vocabulary_service_1.vocabularyService.getLearning(req.userId);
            res.json(words);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getKnown(req, res) {
        try {
            const words = await vocabulary_service_1.vocabularyService.getKnown(req.userId);
            res.json(words);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getStats(req, res) {
        try {
            const stats = await vocabulary_service_1.vocabularyService.getStats(req.userId);
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async addWord(req, res) {
        try {
            const { word, translation, level, domain } = req.body;
            if (!word || !translation) {
                res.status(400).json({ error: "Word and translation are required" });
                return;
            }
            const vocab = await vocabulary_service_1.vocabularyService.addWord(req.userId, word, translation, level || "A0", domain || "General Tech", req.body.masteryStatus || "learning");
            res.status(201).json(vocab);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async addWordsFromStory(req, res) {
        try {
            const { words, level, domain } = req.body;
            if (!words || !Array.isArray(words)) {
                res.status(400).json({ error: "Words array is required" });
                return;
            }
            const added = await vocabulary_service_1.vocabularyService.addWordsFromStory(req.userId, words, level || "A0", domain || "General Tech");
            res.json({ added: added.length, words: added });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getPracticeSession(req, res) {
        try {
            const words = await vocabulary_service_1.vocabularyService.getPracticeSession(req.userId);
            res.json(words);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async generateExercise(req, res) {
        try {
            const wordId = req.params.wordId;
            if (typeof wordId !== "string") {
                res.status(400).json({ error: "Invalid ID format" });
                return;
            }
            const { skill } = req.body;
            if (!skill) {
                res.status(400).json({ error: "Skill type is required" });
                return;
            }
            const exercise = await vocabulary_service_1.vocabularyService.generateExercise(req.userId, wordId, skill);
            res.json(exercise);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async recordResult(req, res) {
        try {
            const wordId = req.params.wordId;
            if (typeof wordId !== "string") {
                res.status(400).json({ error: "Invalid ID format" });
                return;
            }
            const { skill, isCorrect } = req.body;
            if (!skill || typeof isCorrect !== "boolean") {
                res.status(400).json({ error: "Skill and isCorrect are required" });
                return;
            }
            const result = await vocabulary_service_1.vocabularyService.recordPracticeResult(req.userId, wordId, skill, isCorrect);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async generateNewWords(req, res) {
        try {
            const count = parseInt(req.query.count) || 10;
            const words = await vocabulary_service_1.vocabularyService.generateNewWords(req.userId, count);
            res.json(words);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
//# sourceMappingURL=vocabulary.controller.js.map