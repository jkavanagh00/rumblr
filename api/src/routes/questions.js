/* 
all routes related to questions should be here

examples:
- GET /questions (get an unanswered question for the current user)
- POST /questions/:id/answer (submit an answer to a question)
- POST /questions (add a new question to the system)?
*/

import express from "express";
import { addQuestion_Controller, getQuestionById_Controller, listQuestions_Controller, updateQuestion_Controller, deleteQuestion_Controller } from "../controllers/questions.js";
const questionsRouter = express.Router();

questionsRouter.get("/list", async (req, res) => {
    try {
        const result = await listQuestions_Controller();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

questionsRouter.get("/:id", async (req, res) => {
    try {
        const result = await getQuestionById_Controller(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default questionsRouter;