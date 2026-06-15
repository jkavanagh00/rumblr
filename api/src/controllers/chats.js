/*
all controllers related to chats should be here

examples:

- getChats
- getChatById
- sendMessage
- receiveMessage
*/

import {
  addChat_model,
  addMessage_model,
  getActiveChatsByUserId_model,
  getMessagesByRumbleId_model,
  getRumbleById_model,
  isUserParticipantInRumble_model,
  removeChat_model,
  removeMessage_model,
  updateChat_model,
  updateMessage_model,
} from "../models/chats.js";

function getCurrentUserId(req) {
  if (req.user?.id) {
    return req.user.id;
  }

  const headerUserId = req.headers["x-user-id"];
  if (Array.isArray(headerUserId)) {
    return headerUserId[0];
  }

  return headerUserId;
}

export async function addChat_controller(req, res, next) {
  try {
    const { rumble_request_id, requester_id, receiver_id, status } = req.body;

    if (!rumble_request_id || !requester_id || !receiver_id) {
      return res.status(400).json({
        error: "Validation failed",
        details: {
          rumble_request_id: "rumble_request_id is required",
          requester_id: "requester_id is required",
          receiver_id: "receiver_id is required",
        },
      });
    }
    const chat = await addChat_model({
      rumble_request_id,
      requester_id,
      receiver_id,
      status,
    });
    return res.status(201).json(chat);
  } catch (error) {
    next(error);
  }
}

export async function addMessage_controller(req, res, next) {
  try {
    const rumbleId = req.params.id;
    const content = req.body.content;
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!rumbleId) {
      return res.status(400).json({
        error: "Invalid rumble id",
      });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({
        error: "validation failed",
        details: {
          content: "Content is required",
        },
      });
    }
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
    const message = await addMessage_model({
      rumble_id: rumbleId,
      sender_id: userId,
      content: content.trim(),
    });
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

//Get chat By Id will be added 

export async function getChats_controller(req, res, next) {
  try {
    const userId = getCurrentUserId(req);

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

export async function getMessages_controller(req, res, next) {
  try {
    const rumbleId = req.params.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!rumbleId) {
      return res.status(400).json({
        error: "Invalid rumble id",
      });
    }

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1
    ) {
      return res.status(400).json({
        error: "Invalid pagination values",
      });
    }

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

/* will be added
- Remove chat 
- remove message
- update chat
- update message 
*/


