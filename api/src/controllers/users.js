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

import {
  createBlock_model,
  deleteBlock_model,
  getBlockByUsers_model,
  getBlockedUsersByBlockerId_model,
} from "../models/blocks.js";

import { getOnboardingProgress_model } from "../models/statements.js";

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

    const updatedUser = await updateUserById_model(userId, req.validatedBody);

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

export async function blockUser_controller(req, res, next) {
  try {
    const blockerId = req.user.id;
    const blockedId = req.params.id;

    if (blockerId === blockedId) {
      return res.status(400).json({
        error: "You cannot block yourself",
      });
    }

    const blockedUser = await getUserById_model(blockedId);
    if (!blockedUser) {
      return res.status(404).json({
        error: "User to block not found",
      });
    }

    const existingBlock = await getBlockByUsers_model(blockerId, blockedId);
    if (existingBlock) {
      return res.status(409).json({
        error: "User is already blocked",
      });
    }

    const block = await createBlock_model(blockerId, blockedId);

    return res.status(201).json(block);
  } catch (error) {
    next(error);
  }
}

export async function unblockUser_controller(req, res, next) {
  try {
    const blockerId = req.user.id;
    const blockedId = req.params.id;

    const deletedCount = await deleteBlock_model(blockerId, blockedId);

    if (!deletedCount) {
      return res.status(404).json({
        error: "Block relationship not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getBlockedUsers_controller(req, res, next) {
  try {
    const blockerId = req.user.id;

    const blockedUsers = await getBlockedUsersByBlockerId_model(
      blockerId,
      req.pagination,
    );

    return res.status(200).json(blockedUsers);
  } catch (error) {
    next(error);
  }
}

export async function getOnboardingProgress_controller(req, res, next) {
  try {
    const userId = req.user.id;

    const progress = await getOnboardingProgress_model(userId);

    return res.status(200).json(progress);
  } catch (error) {
    next(error);
  }
}
