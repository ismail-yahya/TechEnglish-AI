"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
exports.authController = {
    async register(req, res) {
        try {
            const { email, name, password } = req.body;
            if (!email || !name || !password) {
                res
                    .status(400)
                    .json({ error: "Email, name, and password are required" });
                return;
            }
            if (password.length < 6) {
                res
                    .status(400)
                    .json({ error: "Password must be at least 6 characters" });
                return;
            }
            const result = await auth_service_1.authService.register(email, password, name);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: "Email and password are required" });
                return;
            }
            const result = await auth_service_1.authService.login(email, password);
            res.json(result);
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    },
    async getProfile(req, res) {
        try {
            // req.userId is now a string (UUID) from auth middleware
            const profile = await auth_service_1.authService.getProfile(req.userId);
            res.json(profile);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    },
    async updateProfile(req, res) {
        try {
            const { name, chosenDomains, currentLevel, speechEnginePreference } = req.body;
            const updated = await auth_service_1.authService.updateProfile(req.userId, {
                name,
                chosenDomains,
                currentLevel,
                speechEnginePreference,
            });
            res.json(updated);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
};
//# sourceMappingURL=auth.controller.js.map