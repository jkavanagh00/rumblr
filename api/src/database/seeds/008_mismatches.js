/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 *
 * This seed file creates mismatches between user pairs.
 * Mismatches are only created for user pairs with 20+ shared responses.
 *
 * User pairs with sufficient shared responses:
 * - alice_agrees (15 responses) vs jack_response_heavy (25) = 15 shared (NOT ENOUGH)
 * - bob_disagrees (15 responses) vs jack_response_heavy (25) = 15 shared (NOT ENOUGH)
 *
 * To get 20+ shared responses, we need users with overlapping statement ranges.
 * This seed creates pre-calculated mismatches for pairs that would naturally occur
 * when they have 20+ shared responses.
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("mismatches").del();

  // Get user IDs
  const users = await knex("users").select("id", "username");

  const userMap = {};
  users.forEach((user) => {
    userMap[user.username] = user.id;
  });

  const mismatches = [];

  // Helper to ensure user1_id < user2_id (as required by the schema check constraint)
  const createMismatch = (user1Name, user2Name, score, shared, confidence) => {
    const id1 = userMap[user1Name];
    const id2 = userMap[user2Name];

    if (!id1 || !id2) return null;

    if (id1 === id2) return null;

    const [user1_id, user2_id] = [id1, id2].sort();

    return {
      user1_id,
      user2_id,
      mismatch_score: score,
      shared_responses: shared,
      confidence,
    };
  };

  // Create mismatches for user pairs
  // Note: In a real scenario, these would be calculated automatically,
  // but for testing we create pre-seeded values

  // alice_agrees vs bob_disagrees: Strong disagreement on nearly everything
  // Alice: progressive, Bob: conservative = High mismatch
  const alice_bob = createMismatch(
    "alice_agrees",
    "bob_disagrees",
    85,
    25,
    "high",
  );
  if (alice_bob) mismatches.push(alice_bob);

  // alice_agrees vs carol_moderate: Some disagreement, but moderate overall
  // Alice: progressive, Carol: moderate = Medium mismatch
  const alice_carol = createMismatch(
    "alice_agrees",
    "carol_moderate",
    35,
    22,
    "medium",
  );
  if (alice_carol) mismatches.push(alice_carol);

  // bob_disagrees vs carol_moderate: Some disagreement
  // Bob: conservative, Carol: moderate = Medium mismatch
  const bob_carol = createMismatch(
    "bob_disagrees",
    "carol_moderate",
    45,
    20,
    "medium",
  );
  if (bob_carol) mismatches.push(bob_carol);

  // david_active vs alice_agrees: Similar progressive views
  // David: progressive, Alice: progressive = Low mismatch
  const david_alice = createMismatch(
    "david_active",
    "alice_agrees",
    22,
    23,
    "medium",
  );
  if (david_alice) mismatches.push(david_alice);

  // david_active vs bob_disagrees: Major disagreement
  // David: progressive, Bob: conservative = High mismatch
  const david_bob = createMismatch(
    "david_active",
    "bob_disagrees",
    82,
    24,
    "high",
  );
  if (david_bob) mismatches.push(david_bob);

  // frank_blocked vs grace_blocker: Progressive alignment
  // Frank: somewhat progressive, Grace: progressive = Low mismatch
  const frank_grace = createMismatch(
    "frank_blocked",
    "grace_blocker",
    28,
    20,
    "medium",
  );
  if (frank_grace) mismatches.push(frank_grace);

  // jack_response_heavy vs alice_agrees: High alignment (both progressive)
  // Jack: progressive, Alice: progressive = Low mismatch
  const jack_alice = createMismatch(
    "jack_response_heavy",
    "alice_agrees",
    18,
    25,
    "high",
  );
  if (jack_alice) mismatches.push(jack_alice);

  // jack_response_heavy vs bob_disagrees: High disagreement
  // Jack: progressive, Bob: conservative = High mismatch
  const jack_bob = createMismatch(
    "jack_response_heavy",
    "bob_disagrees",
    88,
    25,
    "high",
  );
  if (jack_bob) mismatches.push(jack_bob);

  // jack_response_heavy vs carol_moderate: Moderate disagreement
  // Jack: progressive, Carol: moderate = Medium mismatch
  const jack_carol = createMismatch(
    "jack_response_heavy",
    "carol_moderate",
    38,
    24,
    "high",
  );
  if (jack_carol) mismatches.push(jack_carol);

  // karen_response_light vs alice_agrees: Similar views
  // Karen: somewhat progressive, Alice: progressive = Low mismatch (but low confidence due to few responses)
  const karen_alice = createMismatch(
    "karen_response_light",
    "alice_agrees",
    25,
    20,
    "low",
  );
  if (karen_alice) mismatches.push(karen_alice);

  if (mismatches.length > 0) {
    await knex("mismatches").insert(mismatches);
  }
}
