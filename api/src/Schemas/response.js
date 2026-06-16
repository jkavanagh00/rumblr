import { z } from "zod";

export const createResponseSchema = z.object({
  user_id: z
    .string({ required_error: "User ID is required" })
    .uuid({ message: "Invalid User ID format. Must be a UUID" }),
    
  question_id: z
    .string({ required_error: "Question ID is required" })
    .uuid({ message: "Invalid Question ID format. Must be a UUID" }),
    
  value: z
    .number({ required_error: "Value is required" })
    .int({ message: "Value must be an integer" }),
});

