import express from "express";
import { createRumbleSchema } from "../schemas/rumbles.js";
import {
  createMessageParamsSchema,
  createMessageSchema,
} from "../schemas/messages.js";
import { paginationSchema } from "../schemas/pagination.js";
import { authenticateToken } from "../middlewares/auth.js";
import {
  getRumbles_controller,
  terminateRumble_controller,
} from "../controllers/rumbles.js";
import {
  addMessage_controller,
  getMessages_controller,
} from "../controllers/messages.js";
import {
  validateParams,
  validateQuery,
  validateRequest,
  validateBody,
} from "../middlewares/errors.js";
import { idParamsSchema } from "../schemas/common.js";

const router = express.Router();

router.use(authenticateToken);

/**
 * @openapi
 * /rumbles:
 *   get:
 *     tags:
 *       - Rumbles
 *     summary: Get all rumbles for the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Paginated list of rumbles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rumble'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *             example:
 *               data:
 *                 - id: "6c260923-bf5e-45fd-a26c-9ec32f174851"
 *                   requester_id: "22cc44f9-8707-4600-9017-acfce7ece11e"
 *                   receiver_id: "9eb700fe-4b40-48f5-9344-030ca5f9de30"
 *                   status: "active"
 *               pagination:
 *                 page: 1
 *                 limit: 20
 *                 total: 1
 *                 totalPages: 1
 *                 hasNext: false
 *                 hasPrev: false
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

router.get(
  "/",
  validateQuery(paginationSchema, "pagination"),
  getRumbles_controller,
);
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

router.put(
  "/:id/terminate",
  validateParams(idParamsSchema),
  terminateRumble_controller,
);

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

router.get(
  "/:id/messages",
  validateParams(idParamsSchema),
  validateParams(createMessageParamsSchema),
  validateQuery(paginationSchema, "pagination"),
  getMessages_controller,
);

router.post(
  "/:id/messages",
  validateParams(idParamsSchema),
  validateParams(createMessageParamsSchema),
  validateRequest(
    createMessageSchema,
    (req) => ({
      rumble_id: req.params.id,
      sender_id: req.user.id,
      content: req.body.content,
    }),
    (req, data) => {
      req.validatedBody = data;
    },
  ),
  addMessage_controller,
);

export default router;
