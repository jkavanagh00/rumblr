import express from "express";
import { paginationSchema } from "../Schemas/pagination.js";
import { updateUserSchema } from "../schemas/users.js";
import { blockParamsSchema } from "../schemas/block.js";
import { authenticateToken } from "../middlewares/auth.js";
import {
  getUser_controller,
  updateUser_controller,
  deleteUser_controller,
  blockUser_controller,
  unblockUser_controller,
  getBlockedUsers_controller,
  getOnboardingProgress_controller,
} from "../controllers/users.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/errors.js";

const router = express.Router();

router.use(authenticateToken);

/**
 * @openapi
 * /user/blocks:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users blocked by the current user
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
 *         description: Paginated list of blocked users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
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
 *                 - id: "9eb700fe-4b40-48f5-9344-030ca5f9de30"
 *                   username: "blocked_user"
 *               pagination:
 *                 page: 1
 *                 limit: 20
 *                 total: 1
 *                 totalPages: 1
 *                 hasNext: false
 *                 hasPrev: false
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/blocks",
  validateQuery(paginationSchema, "pagination"),
  getBlockedUsers_controller,
);

/**
 * @openapi
 * /user/blocks/{id}:
 *   post:
 *     tags:
 *       - Users
 *     summary: Block a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to block
 *         example: "fb9123f7-1666-4850-97b3-237647a07b15"
 *     responses:
 *       201:
 *         description: User blocked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Block'
 *       400:
 *         description: Cannot block yourself
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: User is already blocked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   delete:
 *     tags:
 *       - Users
 *     summary: Unblock a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to unblock
 *         example: "fb9123f7-1666-4850-97b3-237647a07b15"
 *     responses:
 *       204:
 *         description: User unblocked
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  "/blocks/:id",
  validateParams(blockParamsSchema),
  blockUser_controller,
);
router.delete(
  "/blocks/:id",
  validateParams(blockParamsSchema),
  unblockUser_controller,
);
/**
 * @openapi
 * /user/onboarding:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get onboarding progress for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding progress
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnboardingProgress'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/onboarding", getOnboardingProgress_controller);

/**
 * @openapi
 * /user:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get the current user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   put:
 *     tags:
 *       - Users
 *     summary: Update the current user's profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserBody'
 *     responses:
 *       200:
 *         description: Updated user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete the current user's account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Account deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/", getUser_controller);
router.put("/", validateBody(updateUserSchema), updateUser_controller);
router.delete("/", deleteUser_controller);

export default router;
