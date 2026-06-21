import db from "./../database/db.js";
import { calculateMismatchScore } from "./../utils/mismatches.js";
import { fetchSharedResponses_model } from "./responses.js";

export async function upsertMismatch_model(user1Id, user2Id, trx = db) {
  const [leftUserId, rightUserId] =
    user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

  const sharedResponses = await fetchSharedResponses_model(
    leftUserId,
    rightUserId,
    trx,
  );
  const existingMismatch = await trx("mismatches")
    .where({ user1_id: leftUserId, user2_id: rightUserId })
    .first();

  if (existingMismatch && sharedResponses.length < 20) {
    await trx("mismatches").where("id", existingMismatch.id).delete();
  } else if (existingMismatch) {
    const mismatchData = calculateMismatchScore(sharedResponses);
    await trx("mismatches").where("id", existingMismatch.id).update({
      mismatch_score: mismatchData.mismatchScore,
      confidence: mismatchData.confidence,
      shared_responses: mismatchData.sharedResponses,
      updated_at: new Date(),
    });
  } else if (!existingMismatch && sharedResponses.length >= 20) {
    const mismatchData = calculateMismatchScore(sharedResponses);
    await trx("mismatches").insert({
      user1_id: leftUserId,
      user2_id: rightUserId,
      mismatch_score: mismatchData.mismatchScore,
      confidence: mismatchData.confidence,
      shared_responses: mismatchData.sharedResponses,
    });
  }
}

export async function listMismatchesForUser_model(userId, trx = db) {
  return await trx("mismatches")
    .where("user1_id", userId)
    .orWhere("user2_id", userId)
    .select("*")
    .orderBy("mismatch_score", "desc")
    .orderBy("shared_responses", "desc");
}