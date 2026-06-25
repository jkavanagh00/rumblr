import jwt from "jsonwebtoken";
import {
  createUser_model,
  findUserByEmail_model,
  findUserByUsername_model,
  getPublicUserById_model,
} from "../models/users.js";
import { hashPassword, verifyPassword } from "../utils/helpers.js";

function createAccessToken(user) {
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    const error = new Error("ACCESS_TOKEN_SECRET is not configured");
    error.status = 500;
    throw error;
  }

  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    secret,
    {
      algorithm: "HS256",
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "7d",
    },
  );
}

function toPublicUser(user) {
  const { password_hash: passwordHash, email, ...publicUser } = user;
  return publicUser;
}

export async function signup_controller(req, res, next) {
  try {
    const { username, email, password, bio, threat_levels } = req.validatedBody;

    const existingEmailUser = await findUserByEmail_model(email);
    if (existingEmailUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const existingUsernameUser = await findUserByUsername_model(username);
    if (existingUsernameUser) {
      return res.status(409).json({ error: "Username already in use" });
    }

    const createdUser = await createUser_model({
      username,
      email,
      password_hash: await hashPassword(password),
      bio: bio ?? null,
      threat_levels,
    });

    const accessToken = createAccessToken(createdUser);

    return res.status(201).json({
      accessToken,
      user: toPublicUser(createdUser),
    });
  } catch (error) {
    next(error);
  }
}

export async function login_controller(req, res, next) {
  try {
    const { identifier, password } = req.validatedBody;

    const user = identifier.includes("@")
      ? await findUserByEmail_model(identifier)
      : await findUserByUsername_model(identifier);

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = createAccessToken(user);

    return res.status(200).json({
      accessToken,
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

export async function me_controller(req, res, next) {
  try {
    const userId = req.user.id ?? req.userId;
    const user = await getPublicUserById_model(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}
