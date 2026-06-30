import db from "../database/db.js";
import { paginate } from "../utils/pagination.js";

const MESSAGES_TABLE = "messages";

function messagesQuery(trx = db) {
  return trx(MESSAGES_TABLE);
}

export async function getMessagesByRumbleId_model(
  rumbleId,
  pagination = {},
  trx = db,
) {
  return paginate(
    messagesQuery(trx).where({ rumble_id: rumbleId }),
    pagination,
    (qb) => qb.orderBy("sent_at", "asc"),
  );
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
