import { z } from "zod";
export { paginationSchema } from "./pagination.js";

export const createMessageParamsSchema = z.object({
  id: z
    .string({ required_error: "Rumble ID is required" })
    .uuid({ message: "Invalid Rumble ID format. Must be a UUID" }),
});

export const createMessageSchema = z.object({
  rumble_id: z
    .string()
    .uuid({ message: "Invalid Rumble ID format" })
    .optional(),
  sender_id: z
    .string({ required_error: "Sender ID is required" })
    .uuid({ message: "Invalid Sender ID format. Must be a UUID" }),

  content: z
    .string({ required_error: "Message content is required" })
    .trim()
    .min(1, { message: "Message content cannot be empty" }),
});

