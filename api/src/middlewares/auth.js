/*
all middlewares related to authentication

examples:
authenticateJWT - a middleware that checks if the request has a valid JWT token and sets req.user to the authenticated user
*/
import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const decodedPayload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    req.user = decodedPayload;
    return next();
  } catch {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

/**
 * Authorization middleware for Admin-only routes
 * Must be placed AFTER authenticateToken in the middleware chain
 */

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied. Admin privileges required." });
  }

  return next();
};
