import db from "../database/db.js";

export async function getMessagesByRumbleId_model(
  rumbleId,
  { page = 1, limit = 20 } = {},
  trx = db,
) {
  const offset = (page - 1) * limit;

  const data = await messagesQuery(trx)
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

export async function addMessage_model(
  { rumble_id, sender_id, content },
  trx = db,
) {
  const [message] = await messagesQuery(trx)
    .insert({
      rumble_id,
      sender_id,
      content,
    })
    .returning("*");

  return message;
}
