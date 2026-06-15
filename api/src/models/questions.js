/*
all models related to questions should be here

examples:

- listQuestions
- findQuestionById
- findUnansweredQuestion
- createQuestion?
- updateQuestion?
- removeQuestion?
*/
import db from "./../database/db.js";

const TABLE = "questions";

function baseQuery(trx = db) {
  return trx(TABLE);
}

export async function listQuestions_Model(trx = db) {
  const qb = baseQuery(trx);
  const questions = await qb.select("*");
  return questions.length > 0 ? questions : null;
}

export async function addQuestion_Model(question, trx = db) {
  const qb = baseQuery(trx);
  return await qb.insert(question);
}

export async function getQuestionById_Model(id, trx = db) {
  const qb = baseQuery(trx);
  return await qb.select("*").where("id", id).first();
}

export async function updateQuestion_Model(id, updateData, trx = db) {
  const existingQuestion = await baseQuery(trx)
    .select("*")
    .where("id", id)
    .first();

  if (!existingQuestion) {
    return undefined;
  }

  await baseQuery(trx).where("id", id).update(updateData);

  return await baseQuery(trx)
    .select("*")
    .where("id", id)
    .first();
}

export async function deleteQuestion_Model(id, trx = db) {
    const existingQuestion = await baseQuery(trx)
    .select("*")
    .where("id", id)
    .first();

  if (!existingQuestion) {
    return undefined;
  }

  await baseQuery(trx).where("id", id).delete();

  return existingQuestion;
}
