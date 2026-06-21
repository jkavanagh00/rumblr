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

export async function sendRumbleRequest_model(
  requester_id,
  receiver_id,
  trx = db,
) {
  return await trx("rumble_requests").insert({
    requester_id,
    receiver_id,
  });
}

export async function getRumbleRequestById_model(id, trx = db) {
  return await trx("rumble_requests").select("*").where("id", id).first();
}

export async function acceptRumbleRequest_model(data, trx = db) {
  return trx.transaction(async (trx) => {
    await trx("rumble_requests").where("id", data.rumble_request_id).update({ status: "accepted" });
    const [rumble] = await trx("rumbles").insert(data).returning("*");
    return rumble;
  });
}

export async function declineRumbleRequest_model(id, trx = db) {
  return await trx("rumble_requests").where("id", id).update({
    status: "declined",
  });
}

export async function checkForPendingRumbleRequest_model(
  requester_id,
  receiver_id,
  trx = db,
) {
  const pendingRequest = await trx("rumble_requests")
    .select("*")
    .where("requester_id", requester_id)
    .andWhere("receiver_id", receiver_id)
    .andWhere("status", "pending")
    .first();
  return pendingRequest;
}

export async function createRumble_model(data, trx = db) {
  const rumble = await trx("rumbles").insert(data);
  return trx("rumbles").select("*").where("id", rumble.id).first();
}
