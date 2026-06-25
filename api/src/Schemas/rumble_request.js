import { z } from "zod";
import { threatLevelSchema } from "./threat_levels.js";

export const createRumbleRequestSchema = z.object({
  requester_id: z
    .string({ required_error: "Requester ID is required" })
    .uuid({ message: "Invalid Requester ID format. Must be a UUID" }),

  receiver_id: z
    .string({ required_error: "Receiver ID is required" })
    .uuid({ message: "Invalid Receiver ID format. Must be a UUID" }),
  threat_level: threatLevelSchema,

  status: z.enum(["pending", "accepted", "declined"], {
    errorMap: () => ({
      message: "Status must be pending, accepted, or declined",
    }),
  }),
});
