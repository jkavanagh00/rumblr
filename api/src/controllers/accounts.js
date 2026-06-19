/*
all controllers related to accounts should be here

examples:

- signup
- login
- logout
- putAccount
- getAccount
- deleteAccount
*/

import {
  getAccountById_model,
  updateAccountById_model,
  deleteAccountById_model,
} from "../models/accounts.js";

export async function getAccount_controller(req, res, next) {
  try {
    const userId = req.user.id;

    const account = await getAccountById_model(userId);

    if (!account) {
      return res.status(404).json({
        error: "Account not found",
      });
    }

    return res.status(200).json(account);
  } catch (error) {
    next(error);
  }
}

export async function updateAccount_controller(req, res, next) {
  try {
    const userId = req.user.id;

    const updatedAccount = await updateAccountById_model(
      userId,
      req.validatedBody,
    );

    if (!updatedAccount) {
      return res.status(404).json({
        error: "Account not found",
      });
    }

    return res.status(200).json(updatedAccount);
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount_controller(req, res, next) {
  try {
    const userId = req.user.id;

    const deletedAccount = await deleteAccountById_model(userId);

    if (!deletedAccount) {
      return res.status(404).json({
        error: "Account not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
