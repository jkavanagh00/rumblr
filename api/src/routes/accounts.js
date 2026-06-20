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
import { updateAccountSchema } from "../Schemas/account.js";
import { authenticateToken } from "../middlewares/auth.js";
import {
  getAccount_controller,
  updateAccount_controller,
  deleteAccount_controller,
} from "../controllers/accounts.js";
import { validateBody } from "../middlewares/errors.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getAccount_controller);
router.put("/", validateBody(updateAccountSchema), updateAccount_controller);
router.delete("/", deleteAccount_controller);

export default router;
