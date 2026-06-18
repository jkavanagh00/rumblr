import { z } from zod;

const createQuestionSchema = z.object({
    content: z.string({ required_error: "Question content is required"})
});

const updateQuestionSchema = z.object({
    id: z.string({required_error: "Question ID is required"}),
    content: z.string({ required_error: "Updated question content is required"})
});