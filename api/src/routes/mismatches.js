import express from "express";
import { validateBody } from "../middlewares/errors.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js"
import { listMismatchesForUser_controller, sendRumbleRequest_controller } from "../controllers/mismatches.js";

const mismatchesRouter = express.Router();
mismatchesRouter.use(authenticateToken);

mismatchesRouter.get("/", listMismatchesForUser_controller);

mismatchesRouter.post("/:id", sendRumbleRequest_controller);

export default mismatchesRouter;