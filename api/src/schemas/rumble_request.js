import { z } from "zod";
import { threatLevelSchema } from "./threat_levels.js";

export const createRumbleRequestSchema = z.object({
  threat_level: threatLevelSchema,
});
