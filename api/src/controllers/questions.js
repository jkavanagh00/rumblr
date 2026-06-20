/*
all controllers related to questions should be here

examples:

- getUnansweredQuestion
- submitAnswer
- addQuestion?
*/


import {
  addQuestion_model,
  getQuestionById_model,
  listQuestions_model,
  updateQuestion_model,
  deleteQuestion_model,
  upsertResponse_model,
  listResponses_model,
  getQuestionWithNoResponse_model,
  addResponse_model,
} from "../models/questions.js";
import { upsertMismatch, fetchSharedResponses } from "../models/mismatches.js";

export async function getQuestionWithNoResponse_controller(req, res, next) {
  try {
    const question = await getQuestionWithNoResponse_model(req.user.id);

    if (!question) {
      return res.status(204).json({
        error:
          "You have responded to all of our questions! Maybe go and touch grass?",
      });
    }

    return res.status(200).json(question);
  } catch (error) {
    next(error);
  }
}

export async function addQuestion_controller(req, res, next) {
  try {
    const question = await addQuestion_model(req.validatedBody);
    return res.status(201).json(question);
  } catch (error) {
    next(error);
  }
}

export async function getQuestionById_controller(req, res, next) {
  try {
    const id = req.params.id;
    const question = await getQuestionById_model(id);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    return res.status(200).json(question);
  } catch (error) {
    next(error);
  }
}

export async function addResponse_controller(req, res, next) {
  try {
    const questionId = req.params.id;
    const userId = req.user.id;
    const payload = {
      questionId,
      userId,
      agreementScore: req.validatedBody.agreement_score,
      importanceScore: req.validatedBody.importance_score,
    };
    const question = await getQuestionById_model(questionId);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const response = await addResponse_model(payload);
    return res
      .status(201)
      .json({ message: "Response submitted successfully", response });
  } catch (error) {
    next(error);
  }
}

export async function listResponses_controller(req, res, next) {
  try {
    const responses = await listResponses_model(req.user.id);

    if (!responses) {
      return res.status(404).json({ error: "No responses found" });
    }

    return res.status(200).json(responses);
  } catch (error) {
    next(error);
  }
}

export async function listQuestions_controller(req, res, next) {
  try {
    const questions = await listQuestions_model();
    return res.status(200).json(questions);
  } catch (error) {
    next(error);
  }
}

export async function updateQuestion_controller(req, res, next) {
  try {
    const question = await getQuestionById_model(req.params.id);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    const updatedQuestion = await updateQuestion_model(
      req.params.id,
      req.validatedBody,
    );
    return res.status(200).json(updatedQuestion);
  } catch (error) {
    next(error);
  }
}

export async function deleteQuestion_controller(req, res, next) {
  try {
    const question = await getQuestionById_model(req.params.id);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    const deletedQuestion = await deleteQuestion_model(req.params.id);
    return res.status(200).json(deletedQuestion);
  } catch (error) {
    next(error);
  }
}
