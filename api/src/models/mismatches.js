import db from "./../database/db.js";
import { calculateMismatchScore } from "./../utils/mismatches.js";

export async function fetchSharedResponses(user1Id, user2Id) {
  const user1Responses = await db("responses")
    .where("user_id", user1Id)
    .select("question_id", "agreement_score", "importance_score");

  const user2Responses = await db("responses")
    .where("user_id", user2Id)
    .select("question_id", "agreement_score", "importance_score");

  const user2ResponsesMap = new Map();
  user2Responses.forEach((response) => {
    user2ResponsesMap.set(response.question_id, response);
  });

  const sharedResponses = [];
  user1Responses.forEach((response) => {
    if (user2ResponsesMap.has(response.question_id)) {
      const user2Response = user2ResponsesMap.get(response.question_id);
      sharedResponses.push({
        question_id: response.question_id,
        user1_agreement_score: response.agreement_score,
        user1_importance_score: response.importance_score,
        user2_agreement_score: user2Response.agreement_score,
        user2_importance_score: user2Response.importance_score,
      });
    }
  });

  return sharedResponses;
}

export async function upsertMismatch(user1Id, user2Id) {
  const sharedResponses = await fetchSharedResponses(user1Id, user2Id);
  const mismatchData = calculateMismatchScore(sharedResponses);

  const existingMismatch = await db("mismatches")
    .where(function () {
      this.where({ user1_id: user1Id, user2_id: user2Id }).orWhere({
        user1_id: user2Id,
        user2_id: user1Id,
      });
    })
    .first();

  if (existingMismatch) {
    await db("mismatches").where("id", existingMismatch.id).update({
      mismatch_score: mismatchData.mismatchPercentage,
      confidence: mismatchData.confidence,
      shared_responses: mismatchData.totalResponses,
      updated_at: new Date(),
    });
  } else {
    await db("mismatches").insert({
      user1_id: user1Id < user2Id ? user1Id : user2Id,
      user2_id: user1Id < user2Id ? user2Id : user1Id,
      mismatch_score: mismatchData.mismatchPercentage,
      confidence: mismatchData.confidence,
      shared_responses: mismatchData.totalResponses,
    });
  }
}

export async function listMismatchesForUser(userId) {
  return await db("mismatches")
    .where("user1_id", userId)
    .orWhere("user2_id", userId)
    .select("*")
    .orderBy("mismatch_score", "desc")
    .orderBy("shared_responses", "desc");
}
