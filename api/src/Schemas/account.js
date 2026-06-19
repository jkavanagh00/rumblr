import { z } from "zod";

export const updateAccountSchema = z.object({
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
});
