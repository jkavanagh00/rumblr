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
} from "../models/mismatches.js";

export async function listMismatchesForUser_controller(req, res, next) {
  try {
    const mismatches = await listMismatchesForUser_model(req.user.id);

    if (!mismatches) {
      return res.status(404).json({error: "No mismatches found" });
    }
    return res.status(200).json(mismatches);
  } catch (error) {
    next(error);
  }
}

export async function sendRumbleRequest_controller(req, res, next) {
  try {
    const activeRumble = await checkForPendingRumbleRequest_model(
      req.user.id,
      req.params.id,
    );

    if (activeRumble) {
        return res.status(400).json({ error: "Another rumble request is already pending" })
    }

    const request = await sendRumbleRequest_model(req.user.id, req.params.id);
    return res.status(201).json(request);
  } catch (error) {
    next(error);
  }
}
