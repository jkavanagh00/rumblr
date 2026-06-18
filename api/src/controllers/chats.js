import {
  addChat_model,
  addMessage_model,
  getActiveChatsByUserId_model,
  getMessagesByRumbleId_model,
  getRumbleById_model,
  isUserParticipantInRumble_model,
  updateRumbleStatus_model,
} from "../models/chats.js";

export async function addChat_controller(req, res, next) {
  try {
    const chat = await addChat_model(req.validatedBody);
    return res.status(201).json(chat);
  } catch (error) {
    next(error);
  }
}

export async function getChats_controller(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const chats = await getActiveChatsByUserId_model(userId);
    return res.status(200).json({
      data: chats,
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

    // First message moves chat from pending to active.
    if (rumble.status === "pending") {
      await updateRumbleStatus_model(rumbleId, "active");
    }

    const message = await addMessage_model(req.validatedBody);
    const io = req.app.get("io");

    if (io) {
      io.to(`chat:${rumbleId}`).emit("chat:message", {
        type: "chat:message",
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
