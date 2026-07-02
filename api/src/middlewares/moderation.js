import { moderateContent } from "../services/moderation.js";

/**
 * Middleware to check specified fields in the request body for unsafe content.
 * @param {...string} fields - Names of the `req.validatedBody` fields to check.
 */
export const moderateBody =
  (...fields) =>
  async (req, res, next) => {
    try {
      const inputs = fields
        .map((field) => req.validatedBody?.[field])
        .filter(
          (value) => typeof value === "string" && value.trim().length > 0,
        );

      if (inputs.length === 0) {
        return next();
      }

      const { flagged } = await moderateContent(inputs);

      if (flagged) {
        return res.status(422).json({
          error: "This content violates our community guidelines",
        });
      }

      return next();
    } catch (error) {
      // Fail open: don't block users if the moderation service is unavailable.
      console.error("Moderation check failed, allowing request:", error);
      return next();
    }
  };
