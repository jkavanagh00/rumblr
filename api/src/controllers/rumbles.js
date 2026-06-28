import { getRumblesByUserId_model } from "../models/rumbles.js";
import { terminateRumble_service } from "../services/rumbles.js";

export async function getRumbles_controller(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const rumbles = await getRumblesByUserId_model(userId);
    return res.status(200).json({
      data: rumbles,
    });
  } catch (error) {
    next(error);
  }
}

export async function terminateRumble_controller(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rumbleId = req.params.id;
    const terminatedRumble = await terminateRumble_service(rumbleId, userId);
    return res.status(200).json(terminatedRumble);
  } catch (error) {
    // Map error messages to status codes
    if (error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes("not a participant")) {
      return res.status(403).json({ error: error.message });
    }

    next(error);
  }
}
