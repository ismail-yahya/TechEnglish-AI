"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post("/register", auth_controller_1.authController.register);
router.post("/login", auth_controller_1.authController.login);
// Protected routes
router.get("/profile", auth_1.authMiddleware, auth_controller_1.authController.getProfile);
router.put("/profile", auth_1.authMiddleware, auth_controller_1.authController.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map