import { z } from "zod";

export const createResponseSchema = z.object({
  agreement_score: z
    .number({ required_error: "Agreement score is required" })
    .int({ message: "Agreement score must be an integer" })
    .min(1, { message: "Agreement score must be at least 1" })
    .max(5, { message: "Agreement score may be 5 at most" }),

  importance_score: z
    .number({ required_error: "Importance score is required" })
    .int({ message: "Importance score must be an integer" })
    .min(1, { message: "Importance score must be at least 1" })
    .max(5, { message: "Importance score may be 5 at most" }),
  
});

export const updateResponseSchema = createResponseSchema.partial();

