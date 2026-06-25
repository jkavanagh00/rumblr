import db from "../database/db.js";

export async function sendRumbleRequest_model(
  requester_id,
  receiver_id,
  threat_level,
  trx = db,
) {
  const [request] = await trx("rumble_requests")
    .insert({
      requester_id,
      receiver_id,
      threat_level,
    })
    .returning("*");

  return request;
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
  return await trx("rumble_requests").where("id", id).update({
    status: "declined",
  });
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
