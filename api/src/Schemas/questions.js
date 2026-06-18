import { z } from "zod";

export const createQuestionSchema = z.object({
    content: z.string({ required_error: "Question content is required"})
});

export const updateQuestionSchema = z.object({
    id: z.string({required_error: "Question ID is required"}),
    content: z.string({ required_error: "Updated question content is required"}).min(1, "Updated question content must contain text")
});