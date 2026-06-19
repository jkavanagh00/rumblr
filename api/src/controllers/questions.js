/*
all controllers related to questions should be here

examples:

- getUnansweredQuestion
- submitAnswer
- addQuestion?
*/

import { z } from "zod";
import db from "../database/db.js";

import {
  addQuestion_model,
  getQuestionById_model,
  listQuestions_model,
  updateQuestion_model,
  deleteQuestion_model,
  upsertResponse_model,
  listUsersWhoResponded_model,
} from "../models/questions.js";
import { upsertMismatch, fetchSharedResponses } from "../models/mismatches.js";
import { createQuestionSchema } from "../Schemas/questions.js";

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
    const payload = req.validatedBody;
    const question = await getQuestionById_model(questionId);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const response = await db.transaction(async (trx) => {
      const upsertedResponse = await upsertResponse_model(
        questionId,
        userId,
        payload,
        trx,
      );

      const otherUsersWithResponses = await listUsersWhoResponded_model(
        questionId,
        userId,
        trx,
      );

      for (const otherUserId of otherUsersWithResponses) {
        await upsertMismatch(userId, otherUserId, trx);
      }
      return upsertedResponse;
    });
    return res
      .status(201)
      .json({ message: "Response submitted successfully", response });
  } catch (error) {
    next(error);
  }
}

export async function listQuestions_controller() {
  try {
    const result = await listQuestions_model();
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function updateQuestion_controller(id, updateData) {
  try {
    const result = await updateQuestion_model(id, updateData);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteQuestion_controller(id) {
  try {
    const result = await deleteQuestion_model(id);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}
