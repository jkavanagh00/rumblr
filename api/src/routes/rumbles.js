/*
all routes related to rumbles should be here

examples:

- POST/rumbles
- GET /rumbles (get all rumbles for current user)
- GET /rumbles/:id/messages (get all messages for a specific rumble)
- POST /rumbles/:id/messages (create a new rumble message)
*/

import express from "express";
import { createRumbleSchema } from "../Schemas/rumbles.js";
import { createMessageSchema, paginationSchema } from "../Schemas/messages.js";
import { authenticateToken } from "../middlewares/auth.js";
import {
  addRumble_controller,
  getRumbles_controller,
  terminateRumble_controller,
} from "../controllers/rumbles.js";
import {
  addMessage_controller,
  getMessages_controller,
} from "../controllers/messages.js";
import { validateBody } from "../middlewares/errors.js";

const router = express.Router();

router.use(authenticateToken);

const validateAddMessage = (req, res, next) => {
  // Reminder: req.userId must be set by auth middleware before rumble routes.
  const userId = req.userId;
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
  const userId = req.userId;
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

router.get("/", getRumbles_controller);
router.post("/", validateBody(createRumbleSchema), addRumble_controller);
router.put("/:id/terminate", terminateRumble_controller);
router.get("/:id/messages", validateGetMessages, getMessages_controller);
router.post("/:id/messages", validateAddMessage, addMessage_controller);

export default router;
