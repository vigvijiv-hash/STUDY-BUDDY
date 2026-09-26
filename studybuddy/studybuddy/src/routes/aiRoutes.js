const express = require("express");
const { protect } = require("../middleware/auth");
const { askGemini } = require("../utils/gemini");

const router = express.Router();

router.post("/study-plan", protect, async (req, res) => {
    const { goal, availableTime, examDate } = req.body;

    if (!goal || !availableTime || !examDate) {
        return res.status(400).json({
            message: "Goal, available time, and exam date are required"
        });
    }

    const prompt = `
Create a personalized study plan.

Learning Goal: ${goal}
Available Study Time: ${availableTime}
Exam Date: ${examDate}

Generate a clear and practical study schedule with:
1. Topics to study
2. Daily study tasks
3. Revision time
4. Practice or quiz time
5. Final revision before the exam

Keep the plan easy to follow and suitable for a student.
`;

    const studyPlan = await askGemini(prompt);

    res.json({
        message: "Study plan generated successfully",
        studyPlan
    });
});

module.exports = router;