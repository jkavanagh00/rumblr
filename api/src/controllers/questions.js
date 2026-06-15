/*
all controllers related to questions should be here

examples:

- getUnansweredQuestion
- submitAnswer
- addQuestion?
*/

import { addQuestion_Model } from "../models/questions.js";

export async function addQuestion_Controller(question) {
  try {
    const result = await addQuestion_Model(question);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}