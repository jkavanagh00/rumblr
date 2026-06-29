import express from "express";
import { createRumbleSchema } from "../Schemas/rumbles.js";
import {
  createMessageParamsSchema,
  createMessageSchema,
} from "../Schemas/messages.js";
import { paginationSchema } from "../Schemas/pagination.js";
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
import {
  validateBody,
  validateParams,
  validateQuery,
  validateRequest,
} from "../middlewares/errors.js";
import { idParamsSchema } from "../Schemas/common.js";

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
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
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
