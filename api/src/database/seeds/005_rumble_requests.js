/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 *
 * This seed file creates rumble requests between users.
 * Tests scenarios like:
 * - Pending rumble requests
 * - Accepted requests (that link to actual rumbles)
 * - Declined requests
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("rumble_requests").del();

  // Get user IDs
  const users = await knex("users").select("id", "username");

  const userMap = {};
  users.forEach((user) => {
    userMap[user.username] = user.id;
  });

  const requests = [];

  // Pending request: alice_agrees initiates vs bob_disagrees
  if (userMap["alice_agrees"] && userMap["bob_disagrees"]) {
    requests.push({
      requester_id: userMap["alice_agrees"],
      receiver_id: userMap["bob_disagrees"],
      status: "pending",
    });
  }

  // Pending request: david_active initiates vs carol_moderate
  if (userMap["david_active"] && userMap["carol_moderate"]) {
    requests.push({
      requester_id: userMap["david_active"],
      receiver_id: userMap["carol_moderate"],
      status: "pending",
    });
  }

  // Accepted request: alice_agrees initiates vs carol_moderate
  // (this will link to actual rumble)
  if (userMap["alice_agrees"] && userMap["carol_moderate"]) {
    requests.push({
      requester_id: userMap["alice_agrees"],
      receiver_id: userMap["carol_moderate"],
      status: "accepted",
    });
  }

  // Accepted request: david_active initiates vs bob_disagrees
  // (this will link to actual rumble)
  if (userMap["david_active"] && userMap["bob_disagrees"]) {
    requests.push({
      requester_id: userMap["david_active"],
      receiver_id: userMap["bob_disagrees"],
      status: "accepted",
    });
  }

  // Declined request: bob_disagrees initiates vs emma_passive
  if (userMap["bob_disagrees"] && userMap["emma_passive"]) {
    requests.push({
      requester_id: userMap["bob_disagrees"],
      receiver_id: userMap["emma_passive"],
      status: "declined",
      declined_at: new Date().toISOString(),
    });
  }

  // Declined request: carol_moderate initiates vs frank_blocked
  if (userMap["carol_moderate"] && userMap["frank_blocked"]) {
    requests.push({
      requester_id: userMap["carol_moderate"],
      receiver_id: userMap["frank_blocked"],
      status: "declined",
      declined_at: new Date().toISOString(),
    });
  }

  if (requests.length > 0) {
    await knex("rumble_requests").insert(requests);
  }
}
