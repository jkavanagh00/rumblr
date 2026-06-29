import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.string().uuid({ message: "Invalid ID format. Must be a UUID" }),
});