/*
all routes related to chats should be here

examples:

- POST/chats
- GET /chats (get all chats for current user)
- GET /chats/:id/messages (get all messages for a specific chat)
- POST /chats/:id/messages (create a new chat message)
*/

import express from "express";
import { createRumbleSchema } from "../Schemas/rumbles.js";
import { createMessageSchema, paginationSchema } from "../Schemas/messages.js";
import {
  addChat_controller,
  addMessage_controller,
  getChats_controller,
  getMessages_controller,
  getCurrentUserId,
} from "../controllers/chats.js";

const router = express.Router();

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(result.error);
  }
  req.validatedBody = result.data;
  next();
};

const validateAddMessage = (req, res, next) => {
  const userId = getCurrentUserId(req);
  if (!userId) {
    const error = new Error("Unauthorized");
    error.status = 401;
    return next(error);
  }

  const result = createMessageSchema.safeParse({
    rumble_id: req.params.id,
    sender_id: userId,
    content: req.body.content,
  });
  if (!result.success) {
    return next(result.error);
  }
  req.validatedBody = result.data;
  req.userId = userId;
  next();
};

// Validation middleware for getting messages (pagination + auth)
const validateGetMessages = (req, res, next) => {
  const userId = getCurrentUserId(req);
  if (!userId) {
    const error = new Error("Unauthorized");
    error.status = 401;
    return next(error);
  }

  const result = paginationSchema.safeParse({
    page: req.query.page,
    limit: req.query.limit,
  });
  if (!result.success) {
    return next(result.error);
  }
  req.pagination = result.data;
  req.userId = userId;
  next();
};

router.get("/", getChats_controller);
router.post("/", validateBody(createRumbleSchema), addChat_controller);
router.get("/:id/messages", validateGetMessages, getMessages_controller);
router.post("/:id/messages", validateAddMessage, addMessage_controller);

export default router;
