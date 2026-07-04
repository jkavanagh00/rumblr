import express from "express";
import { paginationSchema } from "../schemas/pagination.js";
import {
  createStatementSchema,
  updateStatementSchema,
} from "../schemas/statements.js";
import {
  addStatement_controller,
  getStatementById_controller,
  listStatements_controller,
  updateStatement_controller,
  deleteStatement_controller,
  getStatementWithNoResponse_controller,
  getOnboardingStatement_controller,
} from "../controllers/statements.js";
import {
  addResponse_controller,
  listResponses_controller,
} from "../controllers/responses.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/errors.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";
import { createResponseSchema } from "../schemas/response.js";
import { idParamsSchema } from "../schemas/common.js";

const statementsRouter = express.Router();
statementsRouter.use(authenticateToken);

/**
 * @openapi
 * /statements:
 *   get:
 *     tags:
 *       - Statements
 *     summary: Get an unanswered statement for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: >
 *           An unanswered statement, or — when every statement has been
 *           answered — an object with an `error` message instead.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Statement'
 *                 - $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
statementsRouter.get("/", getStatementWithNoResponse_controller);

/**
 * @openapi
 * /statements/{id}/respond:
 *   post:
 *     tags:
 *       - Statements
 *     summary: Submit a response to a statement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the statement to respond to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResponseBody'
 *     responses:
 *       201:
 *         description: Response submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
statementsRouter.post(
  "/:id/respond",
  validateParams(idParamsSchema),
  validateBody(createResponseSchema),
  addResponse_controller,
);

/**
 * @openapi
 * /statements/onboarding/{number}:
 *   get:
 *     tags:
 *       - Statements
 *     summary: Get an onboarding statement by its number (1-10)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Onboarding statement number
 *     responses:
 *       200:
 *         description: The onboarding statement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Statement'
 *       400:
 *         description: Invalid statement number
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Onboarding statements must be answered in order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 nextNumber:
 *                   type: integer
 *             example:
 *               error: You must answer onboarding statement 3 next
 *               nextNumber: 3
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
statementsRouter.get("/onboarding/:number", getOnboardingStatement_controller);

/**
 * @openapi
 * /statements/responses:
 *   get:
 *     tags:
 *       - Statements
 *     summary: Get all responses submitted by the current user
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
 *         description: Paginated list of responses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Response'
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
 */
statementsRouter.get(
  "/responses",
  validateQuery(paginationSchema, "validatedQuery"),
  listResponses_controller,
);

/**
 * @openapi
 * /statements/list:
 *   get:
 *     tags:
 *       - Statements
 *     summary: List all statements (admin only)
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
 *         description: Paginated list of all statements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Statement'
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
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
statementsRouter.get(
  "/list",
  validateQuery(paginationSchema, "validatedQuery"),
  requireAdmin,
  listStatements_controller,
);

/**
 * @openapi
 * /statements/{id}:
 *   get:
 *     tags:
 *       - Statements
 *     summary: Get a statement by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the statement
 *     responses:
 *       200:
 *         description: The statement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Statement'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   patch:
 *     tags:
 *       - Statements
 *     summary: Update a statement (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the statement to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStatementBody'
 *     responses:
 *       200:
 *         description: Updated statement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Statement'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   delete:
 *     tags:
 *       - Statements
 *     summary: Delete a statement (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the statement to delete
 *     responses:
 *       200:
 *         description: Deleted statement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Statement'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
statementsRouter.get(
  "/:id",
  validateParams(idParamsSchema),
  getStatementById_controller,
);

/**
 * @openapi
 * /statements:
 *   post:
 *     tags:
 *       - Statements
 *     summary: Create a new statement (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStatementBody'
 *     responses:
 *       201:
 *         description: Statement created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Statement'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
statementsRouter.post(
  "/",
  requireAdmin,
  validateBody(createStatementSchema),
  addStatement_controller,
);

statementsRouter.patch(
  "/:id",
  validateParams(idParamsSchema),
  requireAdmin,
  validateBody(updateStatementSchema),
  updateStatement_controller,
);

statementsRouter.delete(
  "/:id",
  validateParams(idParamsSchema),
  requireAdmin,
  deleteStatement_controller,
);

export default statementsRouter;
