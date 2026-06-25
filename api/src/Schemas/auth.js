import { z } from "zod";
import { threatLevelsSchema } from "./threat_levels.js";

export const signupSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, { message: "Username must be at least 3 characters long" }),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Email must be a valid email address" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" }),
  bio: z.string().trim().max(280).optional(),
  threat_levels: threatLevelsSchema.default(["green"]),
});

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: "Email or username is required" })
    .trim()
    .min(1, { message: "Email or username is required" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, { message: "Password is required" }),
});
