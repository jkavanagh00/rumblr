import { z } from "zod";

export const createStatementSchema = z.object({
    content: z.string({ required_error: "Statement content is required"})
});

export const updateStatementSchema = createStatementSchema.partial();