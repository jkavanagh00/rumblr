/*
all controllers related to mismatches should be here

examples:

- getMismatches
- sendRumbleRequest
- acceptRumbleRequest
- rejectRumbleRequest
*/

import {
  listMismatchesForUser_model,
  sendRumbleRequest_model,
  checkForPendingRumbleRequest_model,
  getRumbleRequestById_model,
  acceptRumbleRequest_model,
  createRumble_model,
  declineRumbleRequest_model,
} from "../models/mismatches.js";
import db from "../database/db.js";

export async function listMismatchesForUser_controller(req, res, next) {
  try {
    const mismatches = await listMismatchesForUser_model(req.user.id);

    if (!mismatches) {
      return res.status(404).json({ error: "No mismatches found" });
    }
    return res.status(200).json(mismatches);
  } catch (error) {
    next(error);
  }
}
