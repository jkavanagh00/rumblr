/*
all models related to statements should be here

examples:

- listStatements
- findStatementById
- findUnansweredStatement
- createStatement?
- updateStatement?
- removeStatement?
*/
import db from "../database/db.js";

const TABLE = "statements";

function baseQuery(trx = db) {
  return trx(TABLE);
}

export async function getStatementWithNoResponse_model(userId, trx = db) {
  const existingResponses = await trx("responses")
    .pluck("statement_id")
    .where("user_id", userId);
  const unansweredStatement = await trx("statements")
    .select("*")
    .whereNotIn("id", existingResponses)
    .first();
  if (!unansweredStatement) {
    return null;
  }
  return unansweredStatement;
}

export async function listStatements_model(trx = db) {
  const qb = baseQuery(trx);
  const statements = await qb.select("*");
  return statements.length > 0 ? statements : null;
}

export async function addStatement_model(statement, trx = db) {
  const qb = baseQuery(trx);
  return await qb.insert(statement);
}

export async function getStatementById_model(id, trx = db) {
  const qb = baseQuery(trx);
  return await qb.select("*").where("id", id).first();
}

export async function updateStatement_model(id, updateData, trx = db) {
  const existingStatement = await baseQuery(trx)
    .select("*")
    .where("id", id)
    .first();

  if (!existingStatement) {
    return undefined;
  }

  await baseQuery(trx).where("id", id).update(updateData);

  return await baseQuery(trx).select("*").where("id", id).first();
}

export async function deleteStatement_model(id, trx = db) {
  const existingStatement = await baseQuery(trx)
    .select("*")
    .where("id", id)
    .first();

  if (!existingStatement) {
    return undefined;
  }

  await baseQuery(trx).where("id", id).delete();

  return existingStatement;
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

export async function listResponses_model(userId, trx = db) {
  const qb = trx("responses");
  const responses = await qb.select("*").where("user_id", userId);
  return responses.length > 0 ? responses : null;
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
