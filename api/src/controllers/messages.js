import {
  addMessage_model,
  getMessagesByRumbleId_model,
} from "../models/messages.js";
import {
  getRumbleById_model,
  isUserParticipantInRumble_model,
} from "../models/rumbles.js";

export async function addMessage_controller(req, res, next) {
  try {
    const rumbleId = req.params.id;
    const userId = req.user.id;

    const rumble = await getRumbleById_model(rumbleId);
    if (!rumble) {
      return res.status(404).json({
        error: "Rumble not found",
      });
    }

    if (rumble.requester_id !== userId && rumble.receiver_id !== userId) {
      return res.status(403).json({
        error: "You are not a participant in this rumble",
      });
    }

    if (rumble.status === "terminated") {
      return res.status(403).json({
        error: "This rumble is terminated",
      });
    }

    const message = await addMessage_model(req.validatedBody);
    const io = req.app.get("io");

    if (io) {
      io.to(`rumble:${rumbleId}`).emit("rumble:message", {
        type: "rumble:message",
        data: message,
      });
    }

    return res.status(201).json(message);
  } catch (error) {
    next(error);
  }
}

export async function getMessages_controller(req, res, next) {
  try {
    const rumbleId = req.params.id;
    const page = req.validatedQuery.page;
    const limit = req.validatedQuery.limit;
    const userId = req.user.id;

    const rumble = await getRumbleById_model(rumbleId);
    if (!rumble) {
      return res.status(404).json({
        error: "Rumble not found",
      });
    }

    if (rumble.requester_id !== userId && rumble.receiver_id !== userId) {
      return res.status(403).json({
        error: "You are not a participant in this rumble",
      });
    }

    const result = await getMessagesByRumbleId_model(rumbleId, {
      page,
      limit,
    });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
