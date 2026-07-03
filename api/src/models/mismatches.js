import db from "./../database/db.js";
import { paginate } from "../utils/pagination.js";
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

  if (existingMismatch && sharedResponses.length < 10) {
    await trx("mismatches").where("id", existingMismatch.id).delete();
  } else if (existingMismatch) {
    const mismatchData = calculateMismatchScore(sharedResponses);
    await trx("mismatches").where("id", existingMismatch.id).update({
      mismatch_score: mismatchData.mismatchScore,
      confidence: mismatchData.confidence,
      shared_responses: mismatchData.sharedResponses,
      updated_at: new Date(),
    });
  } else if (!existingMismatch && sharedResponses.length >= 10) {
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

export async function listMismatchesForUser_model(
  userId,
  pagination = {},
  trx = db,
) {
  const mismatchesWithUsernames = trx("mismatches")
    .join("users as user1", "mismatches.user1_id", "user1.id")
    .join("users as user2", "mismatches.user2_id", "user2.id")
    .where((builder) => {
      builder
        .where("mismatches.user1_id", userId)
        .orWhere("mismatches.user2_id", userId);
    })
    .select([
      "mismatches.*",
      "user1.username as user1_username",
      "user2.username as user2_username",
      "user1.threat_levels as user1_threat_levels",
      "user2.threat_levels as user2_threat_levels",
    ]);

  return paginate(
    trx(mismatchesWithUsernames.as("mismatches_with_usernames")),
    pagination,
    (qb) =>
      qb.orderBy("mismatch_score", "desc").orderBy("shared_responses", "desc"),
  );
}
