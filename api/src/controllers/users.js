/*
all controllers related to users should be here

examples:

- signup
- login
- logout
- putUser
- getUser
- deleteUser
*/

import {
  getUserById_model,
  updateUserById_model,
  deleteUserById_model,
} from "../models/users.js";

export async function getUser_controller(req, res, next) {
  try {
    const userId = req.user.id;

    const user = await getUserById_model(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateUser_controller(req, res, next) {
  try {
    const userId = req.user.id;

    const updatedUser = await updateUserById_model(
      userId,
      req.validatedBody,
    );

    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser_controller(req, res, next) {
  try {
    const userId = req.user.id;

    const deletedUser = await deleteUserById_model(userId);

    if (!deletedUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
