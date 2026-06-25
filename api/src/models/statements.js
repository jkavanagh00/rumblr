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
import db from "./../database/db.js";

const TABLE = "statements";

const ONBOARDING_STATEMENT_CONTENT = {
  1: "Donald Trump is a force for good in the world.",
  2: "LGBT people face discrimination in society.",
  3: "There are only two genders.",
  4: "Multiculturalism doesn’t work.",
  5: "Abortion should be available to all who want it.",
  6: "Taxation is theft.",
  7: "Religion is a cancer on society.",
  8: "People should require a license in order to become parents.",
  9: "Murderers deserve the death penalty.",
  10: "True equality is impossible to achieve.",
};

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

export async function getOnboardingStatement_model(statementNumber, trx = db) {
  const qb = baseQuery(trx);

  return await qb
    .select("*")
    .where("content", ONBOARDING_STATEMENT_CONTENT[statementNumber])
    .first();
}

export async function getOnboardingProgress_model(userId, trx = db) {
  const onboardingContents = Object.values(ONBOARDING_STATEMENT_CONTENT);

  const onboardingStatements = await trx("statements")
    .select("id")
    .whereIn("content", onboardingContents);

  const onboardingStatementIds = onboardingStatements.map(
    (statement) => statement.id,
  );

  if (onboardingStatementIds.length === 0) {
    return {
      completed: false,
      answeredCount: 0,
      requiredCount: onboardingContents.length,
      remainingCount: onboardingContents.length,
    };
  }

  const answeredRows = await trx("responses")
    .countDistinct({ answeredCount: "statement_id" })
    .where("user_id", userId)
    .whereIn("statement_id", onboardingStatementIds);

  const answeredCount = Number(answeredRows[0]?.answeredCount ?? 0);
  const requiredCount = onboardingContents.length;

  return {
    completed: answeredCount >= requiredCount,
    answeredCount,
    requiredCount,
    remainingCount: Math.max(requiredCount - answeredCount, 0),
  };
}
