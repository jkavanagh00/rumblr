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