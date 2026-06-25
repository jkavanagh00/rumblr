/*
all routes related to users should be here

examples:

- POST /user/signup
- POST /user/login
- POST /user/logout
- GET /user/ (get current user info)
- PUT /user (update user info)
- DELETE /user/ (delete current user)
*/

import express from "express";
import { updateUserSchema } from "../Schemas/users.js";
import { blockParamsSchema } from "../Schemas/block.js";
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
import { validateBody } from "../middlewares/errors.js";

const router = express.Router();

router.use(authenticateToken);

const validateBlockParams = (req, res, next) => {
  const result = blockParamsSchema.safeParse(req.params);

  if (!result.success) {
    return next(result.error);
  }

  next();
};

router.get("/blocks", getBlockedUsers_controller);
router.post("/blocks/:id", validateBlockParams, blockUser_controller);
router.delete("/blocks/:id", validateBlockParams, unblockUser_controller);
router.get("/onboarding", getOnboardingProgress_controller);
router.get("/", getUser_controller);
router.put("/", validateBody(updateUserSchema), updateUser_controller);
router.delete("/", deleteUser_controller);

export default router;
