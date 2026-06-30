import db from "../database/db.js";
import { getMessageLogByRumbleId_model } from "../models/messages.js";
import {
  createUserReport_model,
  listUserReports_model,
} from "../models/reports.js";
import {
  getActiveRumbleBetweenUsers_model,
  terminateRumble_model,
} from "../models/rumbles.js";
import { getUserById_model } from "../models/users.js";

export async function createUserReport_service(
  { reporterId, reportedUserId, reason },
  database = db,
) {
  if (reporterId === reportedUserId) {
    throw new Error("You cannot report yourself");
  }

  return await database.transaction(async (trx) => {
    const reportedUser = await getUserById_model(reportedUserId, trx);

    if (!reportedUser) {
      throw new Error("Reported user not found");
    }

    const messageLog = await getMessageLogByRumbleId_model(rumble.id, trx);

    const report = await createUserReport_model(
      {
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        rumble_id: rumble.id,
        reason,
        message_log: messageLog,
      },
      trx,
    );

    const terminatedRumble = await terminateRumble_model(rumble.id, trx);

    return {
      report,
      rumble: terminatedRumble,
    };
  });
}

export async function listUserReports_service(pagination, database = db) {
  return listUserReports_model(pagination, database);
}
