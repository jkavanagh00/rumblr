import { listMismatchesForUser_model } from "../models/mismatches.js";

export async function listMismatchesForUser_controller(req, res, next) {
  try {
    const mismatches = await listMismatchesForUser_model(
      req.user.id,
      req.validatedQuery,
    );

    return res.status(200).json(mismatches);
  } catch (error) {
    next(error);
  }
}
