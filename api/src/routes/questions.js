/* 
all routes related to questions should be here

examples:
- GET /questions (get an unanswered question for the current user)
- POST /questions/:id/answer (submit an answer to a question)
- POST /questions (add a new question to the system)?
*/

import express from "express";
import {
  createQuestionSchema,
  updateQuestionSchema,
} from "../Schemas/questions.js";
import {
  addQuestion_controller,
  getQuestionById_controller,
  listQuestions_controller,
  updateQuestion_controller,
  deleteQuestion_controller,
  getQuestionWithNoResponse_controller,
  listResponses_controller
} from "../controllers/questions.js";
import { validateBody } from "../middlewares/errors.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js"
import { createResponseSchema } from "../Schemas/response.js";
const questionsRouter = express.Router();
questionsRouter.use(authenticateToken);

// get a question that the authenticated user has not responded to
questionsRouter.get("/", getQuestionWithNoResponse_controller);

// get a list of all questions
questionsRouter.get("/list", requireAdmin, listQuestions_controller);

// submit a response
questionsRouter.post("/:id/respond", validateBody(createResponseSchema), addResponse_controller);

// get question by id
questionsRouter.get("/:id", getQuestionById_controller);

// get all responses for the current user
questionsRouter.get("/responses", listResponses_controller)

export default questionsRouter;
