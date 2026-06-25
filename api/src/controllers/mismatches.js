import {
  listMismatchesForUser_model,
} from "../models/mismatches.js";
import db from "../database/db.js";

export async function listMismatchesForUser_controller(req, res, next) {
  try {
    const mismatches = await listMismatchesForUser_model(req.user.id);

    if (!mismatches) {
      return res.status(404).json({ error: "No mismatches found" });
    }
    return res.status(200).json(mismatches);
  } catch (error) {
    next(error);
  }
}
