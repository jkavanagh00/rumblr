import {
  getRumbleById_model,
  isUserParticipantInRumble_model,
  terminateRumble_model,
} from "../models/rumbles.js";

export async function terminateRumble_service(rumbleId, userId) {
  const rumble = await getRumbleById_model(rumbleId);

  if (!rumble) {
    throw new Error("Rumble not found");
  }

  const isParticipant = await isUserParticipantInRumble_model(rumbleId, userId);

  if (!isParticipant) {
    throw new Error("You are not a participant in this rumble");
  }

  if (rumble.status === "terminated") {
    return rumble;
  }

  const terminatedRumble = await terminateRumble_model(rumbleId);

  if (!terminatedRumble) {
    throw new Error("Rumble not found");
  }

  return terminatedRumble;
}
