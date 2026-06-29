import { z } from "zod";

export const threatLevelValues = ["green", "orange", "red"];

export const threatLevelSchema = z.enum(threatLevelValues, {
  errorMap: () => ({
    message: "Threat level must be green, orange, or red",
  }),
});

export const threatLevelsSchema = z
  .array(threatLevelSchema)
  .min(1, { message: "At least one threat level is required" })
  .superRefine((threatLevels, ctx) => {
    const uniqueThreatLevels = new Set(threatLevels);

    if (uniqueThreatLevels.size !== threatLevels.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Threat levels must be unique",
      });
    }
  });
