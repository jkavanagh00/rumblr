import { z } from "zod";
import { threatLevelsSchema } from "./threat_levels.js";

export const updateUserSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, { message: "Username must be at least 3 characters long" })
    .optional(),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Email must be a valid email address" })
    .optional(),
  bio: z.string().trim().max(280).optional(),
  status: z
    .enum(["active", "inactive", "suspended"], {
      message: "Status must be active, inactive, or suspended",
    })
    .optional(),
  threat_levels: threatLevelsSchema.optional(),
});

export const createUserReportSchema = z.object({
  reason: z
    .string({ required_error: "Reason is required" })
    .trim()
    .min(1, { message: "Reason is required" })
    .max(500, {
      message: "Reason must be 500 characters or fewer",
    }),
});
