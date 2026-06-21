import {
  addRumble_model,
  addMessage_model,
  getActiveRumblesByUserId_model,
  getMessagesByRumbleId_model,
  getRumbleById_model,
  isUserParticipantInRumble_model,
  updateRumbleStatus_model,
} from "../models/rumbles.js";

export async function addRumble_controller(req, res, next) {
  try {
    const rumble = await addRumble_model(req.validatedBody);
    return res.status(201).json(rumble);
  } catch (error) {
    next(error);
  }
}

export async function getRumbles_controller(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const rumbles = await getActiveRumblesByUserId_model(userId);
    return res.status(200).json({
      data: rumbles,
    });
  } catch (error) {
    next(error);
  }
}

export async function addMessage_controller(req, res, next) {
  try {
    const rumbleId = req.params.id;
    const userId = req.userId; // Set by validation middleware

    const rumble = await getRumbleById_model(rumbleId);
    if (!rumble) {
      return res.status(404).json({
        error: "Rumble not found",
      });
    }

    const isParticipant = await isUserParticipantInRumble_model(
      rumbleId,
      userId,
    );
    if (!isParticipant) {
      return res.status(403).json({
        error: "You are not a participant in this rumble",
      });
    }

    // First message moves rumble from pending to active.
    if (rumble.status === "pending") {
      await updateRumbleStatus_model(rumbleId, "active");
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
    const page = req.pagination.page; // Set by validation middleware
    const limit = req.pagination.limit; // Set by validation middleware
    const userId = req.userId; // Set by validation middleware

    const rumble = await getRumbleById_model(rumbleId);
    if (!rumble) {
      return res.status(404).json({
        error: "Rumble not found",
      });
    }

    const isParticipant = await isUserParticipantInRumble_model(
      rumbleId,
      userId,
    );
    if (!isParticipant) {
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
