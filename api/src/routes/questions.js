/* 
all routes related to questions should be here

examples:
- GET /questions (get an unanswered question for the current user)
- POST /questions/:id/answer (submit an answer to a question)
- POST /questions (add a new question to the system)?
*/

import express from "express";
import { createQuestionSchema, updateQuestionSchema } from "../Schemas/questions.js"
import { addQuestion_controller, getQuestionById_controller, listQuestions_controller, updateQuestion_controller, deleteQuestion_controller } from "../controllers/questions.js";
import { validateBody } from "../middlewares/errors.js";
const questionsRouter = express.Router();

questionsRouter.post("/", validateBody(createQuestionSchema), addQuestion_controller);

questionsRouter.get("/:id", getQuestionsById_controller);

export default questionsRouter;