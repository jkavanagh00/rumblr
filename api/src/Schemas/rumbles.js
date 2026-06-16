import { z } from "zod";

export const createRumbleSchema = z.object({
  rumble_request_id: z
    .string({ required_error: "Rumble Request ID is required" })
    .uuid({ message: "Invalid Rumble Request ID format. Must be a UUID" }),
    
  requester_id: z
    .string({ required_error: "Requester ID is required" })
    .uuid({ message: "Invalid Requester ID format. Must be a UUID" }),
    
  receiver_id: z
    .string({ required_error: "Receiver ID is required" })
    .uuid({ message: "Invalid Receiver ID format. Must be a UUID" }),
    
  status: z
    .enum(["pending", "active", "completed", "cancelled"], {
      errorMap: () => ({ message: "Status must be pending, active, completed, or cancelled" }),
    })
    .default("pending"),
});