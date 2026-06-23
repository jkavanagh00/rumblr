/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 *
 * This seed file creates block relationships between users.
 * Tests scenarios like:
 * - grace_blocker blocks frank_blocked
 * - alice_agrees blocks iris_suspended (problematic user)
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("blocks").del();

  // Get user IDs
  const users = await knex("users").select("id", "username");

  const userMap = {};
  users.forEach((user) => {
    userMap[user.username] = user.id;
  });

  // Create block relationships
  const blocks = [];

  // grace_blocker blocks frank_blocked
  if (userMap["grace_blocker"] && userMap["frank_blocked"]) {
    blocks.push({
      blocker_id: userMap["grace_blocker"],
      blocked_id: userMap["frank_blocked"],
    });
  }

  // alice_agrees blocks iris_suspended
  if (userMap["alice_agrees"] && userMap["iris_suspended"]) {
    blocks.push({
      blocker_id: userMap["alice_agrees"],
      blocked_id: userMap["iris_suspended"],
    });
  }

  // david_active blocks iris_suspended (multiple people blocking the suspended user)
  if (userMap["david_active"] && userMap["iris_suspended"]) {
    blocks.push({
      blocker_id: userMap["david_active"],
      blocked_id: userMap["iris_suspended"],
    });
  }

  if (blocks.length > 0) {
    await knex("blocks").insert(blocks);
  }
}
