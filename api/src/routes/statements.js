/* 
all routes related to statements should be here

examples:
- GET /statements (get an unanswered statement for the current user)
- POST /statements/:id/answer (submit an answer to a statement)
- POST /statements (add a new statement to the system)?
*/

import express from "express";
import {
  createStatementSchema,
  updateStatementSchema,
} from "../Schemas/statements.js";
import {
  addStatement_controller,
  getStatementById_controller,
  listStatements_controller,
  updateStatement_controller,
  deleteStatement_controller,
  addResponse_controller,
  getStatementWithNoResponse_controller,
  listResponses_controller
} from "../controllers/statements.js";
import { validateBody } from "../middlewares/errors.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js"
import { createResponseSchema } from "../Schemas/response.js";
const statementsRouter = express.Router();
statementsRouter.use(authenticateToken);

// get a statement that the authenticated user has not responded to
statementsRouter.get("/", getStatementWithNoResponse_controller);

// submit a response
statementsRouter.post("/:id/respond", validateBody(createResponseSchema), addResponse_controller);

// get all responses for the current user
statementsRouter.get("/responses", listResponses_controller)

// get a list of all statements
statementsRouter.get("/list", requireAdmin, listStatements_controller);

// get statement by id
statementsRouter.get("/:id", getStatementById_controller);

// post a new statement
statementsRouter.post("/", requireAdmin, validateBody(createStatementSchema), addStatement_controller);

// updates an existing statement
statementsRouter.patch("/:id", requireAdmin, validateBody(updateStatementSchema), updateStatement_controller);

// delete a statement
statementsRouter.delete("/:id", requireAdmin, deleteStatement_controller);

export default statementsRouter;
