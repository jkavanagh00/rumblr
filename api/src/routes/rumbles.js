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

/**
 * @openapi
 * /rumbles:
 *   get:
 *     tags:
 *       - Rumbles
 *     summary: Get all rumbles for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rumbles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rumble'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags:
 *       - Rumbles
 *     summary: Create a new rumble
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRumbleBody'
 *     responses:
 *       201:
 *         description: Rumble created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rumble'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/", getRumbles_controller);
router.post("/", validateBody(createRumbleSchema), addRumble_controller);

/**
 * @openapi
 * /rumbles/{id}/terminate:
 *   put:
 *     tags:
 *       - Rumbles
 *     summary: Terminate a rumble
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the rumble to terminate
 *     responses:
 *       200:
 *         description: Rumble terminated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rumble'
 *       403:
 *         description: Not a participant in this rumble
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put("/:id/terminate", terminateRumble_controller);

/**
 * @openapi
 * /rumbles/{id}/messages:
 *   get:
 *     tags:
 *       - Rumbles
 *     summary: Get messages for a rumble
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the rumble
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of messages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedMessages'
 *       403:
 *         description: Not a participant in this rumble
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags:
 *       - Rumbles
 *     summary: Send a message to a rumble
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the rumble
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMessageBody'
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       403:
 *         description: Not a participant or rumble is terminated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/:id/messages", validateGetMessages, getMessages_controller);
router.post("/:id/messages", validateAddMessage, addMessage_controller);

export default router;
