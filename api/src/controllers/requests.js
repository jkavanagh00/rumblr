import {
  sendRumbleRequest_model,
  checkForPendingRumbleRequest_model,
  getRumbleRequestById_model,
  declineRumbleRequest_model,
  getLatestDeclinedRumbleRequest_model,
} from "../models/requests.js";
import { getUserById_model } from "../models/users.js";
import { acceptRumbleRequest_service } from "../services/requests.js";

const RUMBLE_REQUEST_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function getRemainingCooldownMessage(cooldownEndsAt) {
  const remainingMs = cooldownEndsAt - Date.now();
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  const dayLabel = remainingDays === 1 ? "day" : "days";

  return `You must wait ${remainingDays} more ${dayLabel} before sending another rumble request to this user`;
}

export async function sendRumbleRequest_controller(req, res, next) {
  try {
    const { threat_level } = req.validatedBody;
    const requester = await getUserById_model(req.user.id);
    const receiver = await getUserById_model(req.params.id);

    if (!requester || !receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!requester.threat_levels.includes(threat_level)) {
      return res.status(400).json({
        error: "Requester is not available for this threat level",
      });
    }

    if (!receiver.threat_levels.includes(threat_level)) {
      return res.status(400).json({
        error: "Receiver does not accept this threat level",
      });
    }

    const latestDeclinedRequest = await getLatestDeclinedRumbleRequest_model(
      req.user.id,
      req.params.id,
    );

    if (latestDeclinedRequest?.declined_at) {
      const cooldownEndsAt =
        new Date(latestDeclinedRequest.declined_at).getTime() +
        RUMBLE_REQUEST_COOLDOWN_MS;

      if (Date.now() < cooldownEndsAt) {
        return res.status(400).json({
          error: getRemainingCooldownMessage(cooldownEndsAt),
        });
      }
    }

    const activeRumble = await checkForPendingRumbleRequest_model(
      req.user.id,
      req.params.id,
      threat_level,
    );

    if (activeRumble) {
      return res
        .status(400)
        .json({ error: "Another rumble request is already pending" });
    }

    const request = await sendRumbleRequest_model(
      req.user.id,
      req.params.id,
      threat_level, //need to be checked
    );

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
      threat_level: rumbleRequest.threat_level,
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
