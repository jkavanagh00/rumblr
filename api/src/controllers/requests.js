import {
  sendRumbleRequest_model,
  checkForPendingRumbleRequest_model,
  getRumbleRequestById_model,
  declineRumbleRequest_model,
} from "../models/requests.js";
import { acceptRumbleRequest_service } from "../services/requests.js";

export async function sendRumbleRequest_controller(req, res, next) {
  try {
    const activeRumble = await checkForPendingRumbleRequest_model(
      req.user.id,
      req.params.id,
    );

    if (activeRumble) {
      return res
        .status(400)
        .json({ error: "Another rumble request is already pending" });
    }

    const request = await sendRumbleRequest_model(req.user.id, req.params.id);

    return res.status(201).json(request);
  } catch (error) {
    next(error);
  }
}

export async function acceptRumbleRequest_controller(req, res, next) {
  try {
    const rumbleRequest = await getRumbleRequestById_model(req.params.id);

    if (!rumbleRequest) {
      return res.status(404).json({ error: "Rumble request cannot be found" });
    }

    if (rumbleRequest.receiver_id != req.user.id) {
      return res.status(401).json({
        error: "You are not authorized to accept this rumble request",
      });
    }
    const payload = {
      rumble_request_id: rumbleRequest.id,
      requester_id: rumbleRequest.requester_id,
      receiver_id: req.user.id,
    };
    const rumble = await acceptRumbleRequest_service(payload);
    return res.status(201).json(rumble);
  } catch (error) {
    next(error);
  }
}

export async function declineRumbleRequest_controller(req, res, next) {
  try {
    const rumbleRequest = await getRumbleRequestById_model(req.params.id);

    if (!rumbleRequest) {
      return res.status(404).json({ error: "Rumble request cannot be found" });
    }

    if (rumbleRequest.receiver_id != req.user.id) {
      return res.status(401).json({
        error: "You are not authorized to decline this rumble request",
      });
    }
    await declineRumbleRequest_model(req.params.id);
    return res.status(201).json({ message: "Rumble request declined" });
  } catch (error) {
    next(error);
  }
}