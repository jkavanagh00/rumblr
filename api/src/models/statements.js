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