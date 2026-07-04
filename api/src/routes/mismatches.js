import express from "express";
import { paginationSchema } from "../schemas/pagination.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/errors.js";
import { createRumbleRequestSchema } from "../schemas/rumble_request.js";
import { authenticateToken } from "../middlewares/auth.js";
import {
  acceptRumbleRequest_controller,
  declineRumbleRequest_controller,
  listRumbleRequests_controller,
  sendRumbleRequest_controller,
} from "../controllers/requests.js";
import { listMismatchesForUser_controller } from "../controllers/mismatches.js";
import { idParamsSchema } from "../schemas/common.js";

const mismatchesRouter = express.Router();
mismatchesRouter.use(authenticateToken);

/**
 * @openapi
 * /mismatches:
 *   get:
 *     tags:
 *       - Mismatches
 *     summary: Get all mismatches for the current user
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
 *         description: Paginated list of mismatches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mismatch'
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
 *                 - id: "d8db8ca3-6d7f-4785-a67b-8bf3f31f87fd"
 *                   user1_id: "22cc44f9-8707-4600-9017-acfce7ece11e"
 *                   user2_id: "9eb700fe-4b40-48f5-9344-030ca5f9de30"
 *                   mismatch_score: 0.81
 *                   confidence: 0.72
 *                   shared_responses: 16
 *               pagination:
 *                 page: 1
 *                 limit: 20
 *                 total: 1
 *                 totalPages: 1
 *                 hasNext: false
 *                 hasPrev: false
 *       404:
 *         description: No mismatches found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
mismatchesRouter.get(
  "/",
  validateQuery(paginationSchema, "validatedQuery"),
  listMismatchesForUser_controller,
);

/**
 * @openapi
 * /mismatches/requests:
 *   get:
 *     tags:
 *       - Mismatches
 *     summary: Get rumble requests for the current user
 *     description: Returns both incoming and outgoing rumble requests with their current status and basic user details.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rumble requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RumbleRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
mismatchesRouter.get("/requests", listRumbleRequests_controller);

/**
 * @openapi
 * /mismatches/{id}:
 *   post:
 *     tags:
 *       - Mismatches
 *     summary: Send a rumble request to a mismatched user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the mismatch to challenge
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRumbleRequestBody'
 *     responses:
 *       201:
 *         description: Rumble request sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RumbleRequest'
 *       400:
 *         description: >-
 *           Request rejected. Possible reasons: an active rumble already exists
 *           with this user, another rumble request is already pending, the
 *           threat level is not accepted by the requester or receiver, or the
 *           rejection cooldown for this user has not yet expired.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Cannot send a rumble request between blocked users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Requester or receiver user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
mismatchesRouter.post(
  "/:id",
  validateParams(idParamsSchema),
  validateBody(createRumbleRequestSchema),
  sendRumbleRequest_controller,
);

/**
 * @openapi
 * /mismatches/{id}/accept:
 *   post:
 *     tags:
 *       - Mismatches
 *     summary: Accept a rumble request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the rumble request to accept
 *     responses:
 *       201:
 *         description: Rumble request accepted - rumble created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rumble'
 *       403:
 *         description: >-
 *           Request rejected. Possible reasons: not authorized to accept this
 *           request, or the two users have blocked each other.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Rumble request is no longer pending
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
mismatchesRouter.post(
  "/:id/accept",
  validateParams(idParamsSchema),
  acceptRumbleRequest_controller,
);

/**
 * @openapi
 * /mismatches/{id}/decline:
 *   post:
 *     tags:
 *       - Mismatches
 *     summary: Decline a rumble request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the rumble request to decline
 *     responses:
 *       200:
 *         description: Rumble request declined
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Rumble request declined
 *       403:
 *         description: Not authorized to decline this request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Rumble request is no longer pending
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
mismatchesRouter.post(
  "/:id/decline",
  validateParams(idParamsSchema),
  declineRumbleRequest_controller,
);

export default mismatchesRouter;
