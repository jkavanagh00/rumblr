import {
  sendRumbleRequest_model,
  getRumbleRequestById_model,
  declineRumbleRequest_model,
  getLatestDeclinedRumbleRequest_model,
  listRumbleRequestsForUser_model,
  findPendingRumbleRequestBetweenUsers_model,
} from "../models/requests.js";
import { getActiveRumbleBetweenUsers_model } from "../models/rumbles.js";
import { getBlockBetweenUsers_model } from "../models/blocks.js";
import { getUserById_model } from "../models/users.js";
import { acceptRumbleRequest_service } from "../services/requests.js";

const RUMBLE_REQUEST_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function getRemainingCooldownMessage(cooldownEndsAt) {
  const remainingMs = cooldownEndsAt - Date.now();
  const remainingDays = Math.max(
    1,
    Math.ceil(remainingMs / (24 * 60 * 60 * 1000)),
  );
  const dayLabel = remainingDays === 1 ? "day" : "days";
  const endsAtIso = new Date(cooldownEndsAt).toISOString();

  return `You must wait about ${remainingDays} more ${dayLabel} (until ${endsAtIso}) before sending another rumble request to this user`;
}

export async function sendRumbleRequest_controller(req, res, next) {
  try {
    const { threat_level } = req.validatedBody;
    const requester = await getUserById_model(req.user.id);
    const receiver = await getUserById_model(req.params.id);

    if (!requester || !receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    const block = await getBlockBetweenUsers_model(req.user.id, req.params.id);
    if (block) {
      return res.status(403).json({
        error: "Cannot send a rumble request between blocked users",
      });
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

    const activeRumble = await getActiveRumbleBetweenUsers_model(
      req.user.id,
      req.params.id,
    );

    if (activeRumble) {
      return res.status(400).json({
        error: "You already have an active rumble with this user",
      });
    }

    const pendingRequest = await findPendingRumbleRequestBetweenUsers_model(
      req.user.id,
      req.params.id,
      threat_level,
    );

    if (pendingRequest) {
      return res.status(400).json({
        error: "Another rumble request is already pending",
      });
    }

    const request = await sendRumbleRequest_model(
      req.user.id,
      req.params.id,
      threat_level,
    );

    return res.status(201).json(request);
  } catch (error) {
    next(error);
  }
}

export async function listRumbleRequests_controller(req, res, next) {
  try {
    const userId = req.user.id;

    const requests = await listRumbleRequestsForUser_model(userId);
    return res.status(200).json({ data: requests });
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

    if (rumbleRequest.receiver_id !== req.user.id) {
      return res.status(403).json({
        error: "You are not authorized to accept this rumble request",
      });
    }

    // Only pending requests can be accepted (already accepted/declined ones are locked)
    if (rumbleRequest.status !== "pending") {
      return res.status(409).json({
        error: "This rumble request is no longer pending",
      });
    }
    const payload = {
      rumble_request_id: rumbleRequest.id,
      requester_id: rumbleRequest.requester_id,
      receiver_id: req.user.id,
      status: "active",
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

    if (rumbleRequest.receiver_id !== req.user.id) {
      return res.status(403).json({
        error: "You are not authorized to decline this rumble request",
      });
    }

    // Only pending requests can be declined (already accepted/declined ones are locked)
    if (rumbleRequest.status !== "pending") {
      return res.status(409).json({
        error: "This rumble request is no longer pending",
      });
    }
    await declineRumbleRequest_model(req.params.id);
    return res.status(200).json({ message: "Rumble request declined" });
  } catch (error) {
    next(error);
  }
}
