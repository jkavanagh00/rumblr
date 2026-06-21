import db from "../database/db.js"

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