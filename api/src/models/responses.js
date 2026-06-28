import db from "../database/db.js";

export async function fetchSharedResponses_model(user1Id, user2Id, trx = db) {
  const user1Responses = await trx("responses")
    .where("user_id", user1Id)
    .select("statement_id", "agreement_score", "importance_score");

  const user2Responses = await trx("responses")
    .where("user_id", user2Id)
    .select("statement_id", "agreement_score", "importance_score");

  const user2ResponsesMap = new Map();
  user2Responses.forEach((response) => {
    user2ResponsesMap.set(response.statement_id, response);
  });

  const sharedResponses = [];
  user1Responses.forEach((response) => {
    if (user2ResponsesMap.has(response.statement_id)) {
      const user2Response = user2ResponsesMap.get(response.statement_id);
      sharedResponses.push({
        statement_id: response.statement_id,
        user1_agreement_score: response.agreement_score,
        user1_importance_score: response.importance_score,
        user2_agreement_score: user2Response.agreement_score,
        user2_importance_score: user2Response.importance_score,
      });
    }
  });

  return sharedResponses;
}

/**
 * @param {Object} response - The response data to be inserted into the database.
 * The response object should contain the following properties:
 * - statement_id: The ID of the statement being responded to (required).
 * - user_id: The ID of the user submitting the response (required).
 * - agreement_score: A numeric score representing the level of agreement with the statement (required).
 * - importance_score: A numeric score representing the importance of the statement to the user (required).
 * @param {Object} trx - An optional Knex transaction object. If not provided, the default database connection will be used.
 * @returns {Promise<Array>} - A promise that resolves to an array containing the ID of the newly inserted response.
 * @throws {Error} - Throws an error if the database operation fails.
 */

export async function upsertResponse_model(
  statementId,
  userId,
  payload,
  trx = db,
) {
  const data = {
    statement_id: statementId,
    user_id: userId,
    agreement_score: payload.agreement_score,
    importance_score: payload.importance_score,
  };

  const existingResponse = await trx("responses")
    .select("*")
    .where("statement_id", statementId)
    .andWhere("user_id", userId)
    .first();

  if (existingResponse) {
    await trx("responses").where("id", existingResponse.id).update(data);
  } else {
    await trx("responses").insert(data);
  }
  return await trx("responses")
    .select("*")
    .where("statement_id", statementId)
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

export async function listResponses_model(
  userId,
  { page = 1, limit = 20 } = {},
  trx = db,
) {
  const offset = (page - 1) * limit;
  const qb = trx("responses");
  const data = await qb
    .select("*")
    .where("user_id", userId)
    .limit(limit)
    .offset(offset);

  return {
    data,
    pagination: {
      page,
      limit,
    },
  };
}

export async function listUsersWhoResponded_model(
  statementId,
  excludedUserId,
  trx = db,
) {
  const userIds = await trx("responses")
    .where("statement_id", statementId)
    .whereNot("user_id", excludedUserId)
    .pluck("user_id");
  return userIds;
}
