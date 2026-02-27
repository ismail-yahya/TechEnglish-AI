import { Router } from "express";
import multer from "multer";
import { transcribeAudio } from "../controllers/speech.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/transcribe",
  authMiddleware,
  upload.single("audio"),
  transcribeAudio,
);

export default router;
