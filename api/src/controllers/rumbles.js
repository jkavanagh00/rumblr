import {
  addRumble_model,
  getActiveRumblesByUserId_model,
} from "../models/rumbles.js";

export async function addRumble_controller(req, res, next) {
  try {
    const rumble = await addRumble_model(req.validatedBody);
    return res.status(201).json(rumble);
  } catch (error) {
    next(error);
  }
}

export async function getRumbles_controller(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const rumbles = await getActiveRumblesByUserId_model(userId);
    return res.status(200).json({
      data: rumbles,
    });
  } catch (error) {
    next(error);
  }
}
