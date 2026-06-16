import { z } from "zod";

export const createMessageSchema = z.object({
  rumble_id: z
    .string({ required_error: "Rumble ID is required" })
    .uuid({ message: "Invalid Rumble ID format. Must be a UUID" }),
    
  sender_id: z
    .string({ required_error: "Sender ID is required" })
    .uuid({ message: "Invalid Sender ID format. Must be a UUID" }),
    
  content: z
    .string({ required_error: "Message content is required" })
    .trim()
    .min(1, { message: "Message content cannot be empty" }),
});