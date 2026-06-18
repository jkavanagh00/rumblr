import { ZodError } from "zod";

/*
all middlewares related to error handling

examples:
handleError - a middleware that handles errors and sends appropriate responses
*/
export const validateBody = schema => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return next(result.error);
  }

  req.validatedBody = result.data;
  next();
};

export const errorHandler = (err, req, res, next) => {
  // Handle Zod validation errors
  if (err instanceof ZodError || err?.name === "ZodError" || Array.isArray(err?.issues)) {
    const issues = Array.isArray(err?.issues) ? err.issues : [];

    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Handle all other unexpected server errors
  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
};