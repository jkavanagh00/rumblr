import db from "../database/db.js";

export async function sendRumbleRequest_model(
  requester_id,
  receiver_id,
  threat_level,
  trx = db,
) {
  return await trx("rumble_requests").insert({
    requester_id,
    receiver_id,
    threat_level,
  });
}

export async function getRumbleRequestById_model(id, trx = db) {
  return await trx("rumble_requests").select("*").where("id", id).first();
}

export async function acceptRumbleRequest_model(id, trx = db) {
  return await trx("rumble_requests")
    .where("id", id)
    .andWhere("status", "pending")
    .update({ status: "accepted" });
}

export async function declineRumbleRequest_model(id, trx = db) {
  return await trx("rumble_requests")
    .where("id", id)
    .andWhere("status", "pending")
    .update({
      status: "declined",
      declined_at: trx.fn.now(),
    });
}

export async function getLatestDeclinedRumbleRequest_model(
  requester_id,
  receiver_id,
  trx = db,
) {
  return await trx("rumble_requests")
    .select("declined_at")
    .where({ requester_id, receiver_id, status: "declined" })
    .whereNotNull("declined_at")
    .orderBy("declined_at", "desc")
    .first();
}

export async function checkForPendingRumbleRequest_model(
  requester_id,
  receiver_id,
  threat_level,
  trx = db,
) {
  const pendingRequest = await trx("rumble_requests")
    .select("*")
    .where((builder) => {
      builder
        .where({ requester_id, receiver_id })
        .orWhere({ requester_id: receiver_id, receiver_id: requester_id });
    })
    .andWhere("threat_level", threat_level)
    .andWhere("status", "pending")
    .first();
  return pendingRequest;
}
