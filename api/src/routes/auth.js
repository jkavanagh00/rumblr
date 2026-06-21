import express from "express";
import { loginSchema, signupSchema } from "../Schemas/auth.js";
import {
  login_controller,
  signup_controller,
} from "../controllers/auth.js";

const router = express.Router();


router.post("/signup", validateBody(signupSchema), signup_controller);
router.post("/login", validateBody(loginSchema), login_controller);

export default router;