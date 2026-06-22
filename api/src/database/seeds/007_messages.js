/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 *
 * This seed file creates messages within rumbles.
 * Only adds messages to active rumbles.
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("messages").del();

  // Get rumbles and users
  const rumbles = await knex("rumbles")
    .select("id", "requester_id", "receiver_id", "status")
    .where("status", "active");
  const users = await knex("users").select("id", "username");

  const userMap = {};
  users.forEach((user) => {
    userMap[user.username] = user.id;
  });

  const messages = [];

  // Add messages to active rumbles
  rumbles.forEach((rumble) => {
    // Messages from david_active (requester) vs bob_disagrees (receiver)
    if (
      rumble.requester_id === userMap["david_active"] &&
      rumble.receiver_id === userMap["bob_disagrees"]
    ) {
      // Message 1: david opens
      messages.push({
        rumble_id: rumble.id,
        sender_id: userMap["david_active"],
        content:
          "I think we need to find common ground on climate change. The science is overwhelming.",
      });

      // Message 2: bob responds
      messages.push({
        rumble_id: rumble.id,
        sender_id: userMap["bob_disagrees"],
        content:
          "Climate science has been wrong before. We should be more skeptical of these predictions.",
      });

      // Message 3: david clarifies
      messages.push({
        rumble_id: rumble.id,
        sender_id: userMap["david_active"],
        content:
          "But the consensus among actual climate scientists is 97%+. That's not something to dismiss lightly.",
      });

      // Message 4: bob pushes back
      messages.push({
        rumble_id: rumble.id,
        sender_id: userMap["bob_disagrees"],
        content:
          "Consensus isn't how science works. Evidence is. And the models keep being wrong.",
      });

      // Message 5: david tries reconciliation
      messages.push({
        rumble_id: rumble.id,
        sender_id: userMap["david_active"],
        content:
          "I respect your skepticism, but we should at least agree that reducing emissions is a reasonable precaution.",
      });
    }
  });

  if (messages.length > 0) {
    await knex("messages").insert(messages);
  }
}
