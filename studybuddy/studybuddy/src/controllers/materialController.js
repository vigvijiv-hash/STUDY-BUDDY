const fs = require("fs");
const path = require("path");
const Material = require("../models/Material");
const { askGemini } = require("../utils/gemini");
 
// POST /api/materials/upload
const uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
 
    const { title } = req.body;
    const filePath = path.join(req.file.destination, req.file.filename);
    const content = fs.readFileSync(filePath, "utf-8");
 
    const material = await Material.create({
      user: req.user.id,
      title: title || req.file.originalname,
      content,
      filename: req.file.originalname,
    });
 
    res.status(201).json({ message: "Material uploaded", material });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// POST /api/materials/:id/summarize
const summarizeMaterial = async (req, res) => {
  try {
    const material = await Material.findOne({ _id: req.params.id, user: req.user.id });
    if (!material) return res.status(404).json({ message: "Material not found" });
 
    const prompt = `Summarize the following study material concisely for exam revision:\n\n${material.content}`;
    const summary = await askGemini(prompt);
 
    material.summary = summary;
    await material.save();
 
    res.status(200).json({ summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// POST /api/materials/:id/flashcards
const generateFlashcards = async (req, res) => {
  try {
    const material = await Material.findOne({ _id: req.params.id, user: req.user.id });
    if (!material) return res.status(404).json({ message: "Material not found" });
 
    const prompt = `Based on the following study material, generate 5 flashcards. Respond ONLY with a JSON array like [{"question": "...", "answer": "..."}], no extra text:\n\n${material.content}`;
    const raw = await askGemini(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const flashcards = JSON.parse(cleaned);
 
    material.flashcards = flashcards;
    await material.save();
 
    res.status(200).json({ flashcards });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// POST /api/materials/:id/quiz
const generateQuiz = async (req, res) => {
  try {
    const material = await Material.findOne({ _id: req.params.id, user: req.user.id });
    if (!material) return res.status(404).json({ message: "Material not found" });
 
    const prompt = `Based on the following study material, generate 5 multiple-choice quiz questions. Respond ONLY with a JSON array like [{"question": "...", "options": ["...","...","...","..."], "answer": "A"}], no extra text:\n\n${material.content}`;
    const raw = await askGemini(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const quiz = JSON.parse(cleaned);
 
    material.quiz = quiz;
    await material.save();
 
    res.status(200).json({ quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// POST /api/materials/:id/study-plan
const generateStudyPlan = async (req, res) => {
  try {
    const material = await Material.findOne({ _id: req.params.id, user: req.user.id });
    if (!material) return res.status(404).json({ message: "Material not found" });
 
    const { goal, hoursPerDay, days } = req.body;
    const prompt = `Create a personalized ${days}-day study plan for the goal: "${goal}", with ${hoursPerDay} hours per day, based on this study material:\n\n${material.content}`;
    const studyPlan = await askGemini(prompt);
 
    material.studyPlan = studyPlan;
    await material.save();
 
    res.status(200).json({ studyPlan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
module.exports = {
  uploadMaterial,
  summarizeMaterial,
  generateFlashcards,
  generateQuiz,
  generateStudyPlan,
};