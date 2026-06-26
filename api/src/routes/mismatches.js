import express from "express";
import { validateBody } from "../middlewares/errors.js";
import { createRumbleRequestSchema } from "../Schemas/rumble_request.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js"
import { acceptRumbleRequest_controller, declineRumbleRequest_controller, sendRumbleRequest_controller } from "../controllers/requests.js";
import { listMismatchesForUser_controller } from "../controllers/mismatches.js"

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
 *     responses:
 *       200:
 *         description: List of mismatches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mismatch'
 *       404:
 *         description: No mismatches found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
mismatchesRouter.get("/", listMismatchesForUser_controller);

mismatchesRouter.post("/:id",validateBody(createRumbleRequestSchema),sendRumbleRequest_controller);
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
 *         description: A rumble request is already pending
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
mismatchesRouter.post("/:id", sendRumbleRequest_controller);

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
 *         description: Rumble request accepted — rumble created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rumble'
 *       401:
 *         description: Not authorized to accept this request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
mismatchesRouter.post("/:id/accept", acceptRumbleRequest_controller);

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
 *       201:
 *         description: Rumble request declined
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Rumble request declined
 *       401:
 *         description: Not authorized to decline this request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
mismatchesRouter.post("/:id/decline", declineRumbleRequest_controller);

export default mismatchesRouter;
