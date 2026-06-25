import express from "express";
import { validateBody } from "../middlewares/errors.js";
import { createRumbleRequestSchema } from "../Schemas/rumble_request.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js"
import { acceptRumbleRequest_controller, declineRumbleRequest_controller, sendRumbleRequest_controller } from "../controllers/requests.js";
import { listMismatchesForUser_controller } from "../controllers/mismatches.js"

const mismatchesRouter = express.Router();
mismatchesRouter.use(authenticateToken);

mismatchesRouter.get("/", listMismatchesForUser_controller);

mismatchesRouter.post("/:id",validateBody(createRumbleRequestSchema),sendRumbleRequest_controller);

mismatchesRouter.post("/:id/accept", acceptRumbleRequest_controller);

mismatchesRouter.post("/:id/decline", declineRumbleRequest_controller);

export default mismatchesRouter;