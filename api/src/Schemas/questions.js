import { z } from "zod";

export const createQuestionSchema = z.object({
    content: z.string({ required_error: "Question content is required"})
});

export const updateQuestionSchema = createQuestionSchema.partial();