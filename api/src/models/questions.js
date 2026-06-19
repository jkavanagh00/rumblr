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

export async function listQuestions_model(trx = db) {
  const qb = baseQuery(trx);
  const questions = await qb.select("*");
  return questions.length > 0 ? questions : null;
}

export async function addQuestion_model(question, trx = db) {
  const qb = baseQuery(trx);
  return await qb.insert(question);
}

export async function getQuestionById_model(id, trx = db) {
  const qb = baseQuery(trx);
  return await qb.select("*").where("id", id).first();
}

export async function updateQuestion_model(id, updateData, trx = db) {
  const existingQuestion = await baseQuery(trx)
    .select("*")
    .where("id", id)
    .first();

  if (!existingQuestion) {
    return undefined;
  }

  await baseQuery(trx).where("id", id).update(updateData);

  return await baseQuery(trx).select("*").where("id", id).first();
}

export async function deleteQuestion_model(id, trx = db) {
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

/**
 * @param {Object} response - The response data to be inserted into the database.
 * The response object should contain the following properties:
 * - question_id: The ID of the question being responded to (required).
 * - user_id: The ID of the user submitting the response (required).
 * - agreement_score: A numeric score representing the level of agreement with the question (required).
 * - importance_score: A numeric score representing the importance of the question to the user (required).
 * @param {Object} trx - An optional Knex transaction object. If not provided, the default database connection will be used.
 * @returns {Promise<Array>} - A promise that resolves to an array containing the ID of the newly inserted response.
 * @throws {Error} - Throws an error if the database operation fails.
 */

export async function upsertResponse_model(
  questionId,
  userId,
  payload,
  trx = db,
) {
  const existingResponse = await trx("responses")
    .select("*")
    .where("question_id", questionId)
    .andWhere("user_id", userId)
    .first();

  if (existingResponse) {
    await trx("responses").where("id", existingResponse.id).update(payload);
  } else {
    await trx("responses").insert(payload);
  }
  return await trx("responses")
    .select("*")
    .where("question_id", questionId)
    .andWhere("user_id", userId)
    .first();
}

export async function deleteResponse_model(id, trx = db) {
  const existingResponse = await trx("responses")
    .select("*")
    .where("id", id)
    .first();

  if (!existingResponse) {
    return undefined;
  }

  await trx("responses").where("id", id).delete();

  return existingResponse;
}

export async function listResponses_model(userId, trx = db) {
  const qb = trx("responses");
  const responses = await qb.select("*").where("user_id", userId);
  return responses.length > 0 ? responses : null;
}

export async function listUsersWhoResponded_model(
  questionId,
  excludedUserId,
  trx = db,
) {
  const userIds = await trx("responses")
    .where("question_id", questionId)
    .whereNot("user_id", excludedUserId)
    .pluck("user_id");
  return userIds;
}
