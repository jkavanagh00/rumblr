import { listResponses_model } from "../models/responses.js";
import { addResponse_service } from "../services/responses.js";

export async function addResponse_controller(req, res, next) {
  try {
    const result = await addResponse_service(
      req.user.id,
      req.params.id,
      req.validatedBody,
    );
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listResponses_controller(req, res, next) {
  try {
    const responses = await listResponses_model(req.user.id, req.pagination);

    if (!responses.data.length) {
      return res.status(404).json({ error: "No responses found" });
    }

    return res.status(200).json(responses);
  } catch (error) {
    next(error);
  }
}
