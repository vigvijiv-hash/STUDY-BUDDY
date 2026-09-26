const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  uploadMaterial,
  summarizeMaterial,
  generateFlashcards,
  generateQuiz,
  generateStudyPlan,
} = require("../controllers/materialController");

router.post("/upload", protect, upload.single("file"), uploadMaterial);
router.post("/:id/summarize", protect, summarizeMaterial);
router.post("/:id/flashcards", protect, generateFlashcards);
router.post("/:id/quiz", protect, generateQuiz);
router.post("/:id/study-plan", protect, generateStudyPlan);

module.exports = router;