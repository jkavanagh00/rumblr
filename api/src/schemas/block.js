import { z } from "zod";

export const createBlockSchema = z.object({
  blocker_id: z
    .string({ required_error: "Blocker ID is required" })
    .uuid({ message: "Invalid Blocker ID format. Must be a UUID" }),
    
  blocked_id: z
    .string({ required_error: "Blocked ID is required" })
    .uuid({ message: "Invalid Blocked ID format. Must be a UUID" }),
});

export const blockParamsSchema = z.object({
  id: z
    .string({ required_error: "User ID is required" })
    .uuid({ message: "Invalid User ID format. Must be a UUID" }),
});
