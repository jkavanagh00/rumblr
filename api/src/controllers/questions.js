/*
all controllers related to questions should be here

examples:

- getUnansweredQuestion
- submitAnswer
- addQuestion?
*/

import { addQuestion_Model, getQuestionById_Model, listQuestions_Model, updateQuestion_Model, deleteQuestion_Model } from "../models/questions.js";

export async function addQuestion_Controller(question) {
  try {
    const result = await addQuestion_Model(question);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getQuestionById_Controller(id) {
  try {
    const result = await getQuestionById_Model(id);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function listQuestions_Controller() {
    try {
        const result = await listQuestions_Model();
        return result;
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function updateQuestion_Controller(id, updateData) {
    try {
        const result = await updateQuestion_Model(id, updateData);
        return result;
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function deleteQuestion_Controller(id) {
    try {
        const result = await deleteQuestion_Model(id);
        return result;
    } catch (error) {
        throw new Error(error.message);
    }
}