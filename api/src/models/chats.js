import db from "../database/db.js";

async function addChat_model({
  rumble_request_id,
  requester_id,
  receiver_id,
  status = "scheduled", //I'll update this when the status changed in migration
}) {
  const [chat] = await db("rumbles")
    .insert({
      rumble_request_id,
      requester_id,
      receiver_id,
      status,
    })
    .returning("*");

  return chat;
}

async function addMessage_model({ rumble_id, sender_id, content }) {
  const [message] = await db("messages")
    .insert({
      rumble_id,
      sender_id,
      content,
    })
    .returning("*");

  return message;
}

async function getActiveChatsByUserId_model(userId) {
  return db("rumbles")
    .select("*")
    .where((builder) => {
      builder.where({ requester_id: userId }).orWhere({ receiver_id: userId });
    })
    .andWhere({ status: "scheduled" })
    .orderBy("created_at", "desc");
}

async function getMessageById_model(id) {
  return db("messages").select("*").where({ id }).first();
}

async function getMessagesByRumbleId_model(
  rumbleId,
  { page = 1, limit = 20 } = {},
) {
  const offset = (page - 1) * limit;

  const data = await db("messages")
    .select("*")
    .where({ rumble_id: rumbleId })
    .orderBy("sent_at", "asc")
    .limit(limit)
    .offset(offset);

  return {
    data,
    pagination: {
      page,
      limit,
    },
  };
}

async function getRumbleById_model(id) {
  return db("rumbles").where({ id }).first();
}

async function isUserParticipantInRumble_model(rumbleId, userId) {
  const rumble = await db("rumbles")
    .where({ id: rumbleId })
    .andWhere((builder) => {
      builder.where({ requester_id: userId }).orWhere({ receiver_id: userId });
    })
    .first();

  return Boolean(rumble);
}

async function removeChat_model(id) {
  const [chat] = await db("rumbles").where({ id }).del().returning("*");

  return chat;
}

async function removeMessage_model(id) {
  const [message] = await db("messages").where({ id }).del().returning("*");

  return message;
}

async function updateChat_model(id, updates) {
  const [chat] = await db("rumbles")
    .where({ id })
    .update(updates)
    .returning("*");

  return chat;
}

async function updateMessage_model(id, updates) {
  const [message] = await db("messages")
    .where({ id })
    .update(updates)
    .returning("*");

  return message;
}

export {
  addChat_model,
  addMessage_model,
  getActiveChatsByUserId_model,
  getMessageById_model,
  getMessagesByRumbleId_model,
  getRumbleById_model,
  isUserParticipantInRumble_model,
  removeChat_model,
  removeMessage_model,
  updateChat_model,
  updateMessage_model,
};
