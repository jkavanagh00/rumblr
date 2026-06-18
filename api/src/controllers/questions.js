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
} from "../models/questions.js";

export async function addQuestion_controller(req, res, next) {
  try {
    const result = await addQuestion_model(question);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getQuestionById_controller(id) {
  try {
    const result = await getQuestionById_model(id);
    return result;
  } catch (error) {
    throw new Error(error.message);
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
