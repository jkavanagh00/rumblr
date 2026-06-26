/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 *
 * This seed file creates rumbles (actual debate matches).
 * Each rumble corresponds to an accepted rumble_request.
 *
 * Rumble scenarios:
 * - alice_agrees vs carol_moderate: pending (not started)
 * - david_active vs bob_disagrees: active (in progress)
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("rumbles").del();

  // Get user IDs and rumble request IDs
  const users = await knex("users").select("id", "username");
  const requests = await knex("rumble_requests")
    .select("id", "requester_id", "receiver_id", "status")
    .where("status", "accepted");

  const userMap = {};
  users.forEach((user) => {
    userMap[user.username] = user.id;
  });

  const rumbles = [];

  // Find the corresponding requests to create rumbles from
  requests.forEach((request) => {
    if (
      request.requester_id === userMap["alice_agrees"] &&
      request.receiver_id === userMap["carol_moderate"]
    ) {
      rumbles.push({
        rumble_request_id: request.id,
        requester_id: request.requester_id,
        receiver_id: request.receiver_id,
        status: "inactive",
      });
    }

    if (
      request.requester_id === userMap["david_active"] &&
      request.receiver_id === userMap["bob_disagrees"]
    ) {
      rumbles.push({
        rumble_request_id: request.id,
        requester_id: request.requester_id,
        receiver_id: request.receiver_id,
        status: "active",
      });
    }
  });

  if (rumbles.length > 0) {
    await knex("rumbles").insert(rumbles);
  }
}
