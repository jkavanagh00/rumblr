/*
all routes related to accounts should be here

examples:

- POST /account/signup
- POST /account/login
- POST /account/logout
- GET /account/ (get current account info)
- PUT /account (update account info)
- DELETE /account/ (delete current account)
*/

import express from "express";
import { updateAccountSchema } from "../Schemas/users.js";
import { authenticateToken } from "../middlewares/auth.js";
import {
  getAccount_controller,
  updateAccount_controller,
  deleteAccount_controller,
} from "../controllers/users.js";
import { validateBody } from "../middlewares/errors.js";

const accountRouter = express.Router();

accountRouter.use(authenticateToken);

accountRouter.get("/", getAccount_controller);
accountRouter.put("/", validateBody(updateAccountSchema), updateAccount_controller);
accountRouter.delete("/", deleteAccount_controller);

export default accountRouter;
