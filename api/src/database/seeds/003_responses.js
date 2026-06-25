/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 *
 * This seed file creates responses for the integration tests.
 * It creates a matrix of responses from multiple users to multiple statements.
 *
 * Key scenarios:
 * - alice_agrees and bob_disagrees have opposing views on many topics
 * - carol_moderate provides middle-ground responses
 * - Enough shared responses (10+) between user pairs to calculate mismatches
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("responses").del();

  // Get user IDs - these must match the usernames in 001_users.js
  const users = await knex("users").select("id", "username");
  const statements = await knex("statements").select("id");

  const userMap = {};
  users.forEach((user) => {
    userMap[user.username] = user.id;
  });

  // Create a helper function to generate responses
  const createResponses = [];

  // Helper to create response objects
  const addResponses = (username, statementIndices, scores) => {
    statementIndices.forEach((idx, i) => {
      if (statements[idx]) {
        createResponses.push({
          user_id: userMap[username],
          statement_id: statements[idx].id,
          agreement_score: scores[i].agreement,
          importance_score: scores[i].importance,
        });
      }
    });
  };

  // alice_agrees: Generally agrees with progressive viewpoints, high importance
  addResponses("alice_agrees", [0, 1, 4, 8, 9, 14, 18, 25, 26, 27, 29, 32, 33, 35, 36], [
    { agreement: 5, importance: 5 }, // Trump is force for good - DISAGREE
    { agreement: 5, importance: 5 }, // LGBT discrimination - AGREE
    { agreement: 5, importance: 5 }, // Transatlantic slave trade - AGREE
    { agreement: 5, importance: 5 }, // Racial discrimination - AGREE
    { agreement: 1, importance: 5 }, // Non-binary genders not real - DISAGREE
    { agreement: 5, importance: 5 }, // Children indoctrinated - DISAGREE (she cares)
    { agreement: 1, importance: 5 }, // All achievements by men - DISAGREE
    { agreement: 5, importance: 4 }, // DEI policies needed - AGREE
    { agreement: 5, importance: 4 }, // E-sports real sports - AGREE
    { agreement: 5, importance: 4 }, // Pets indoors - AGREE
    { agreement: 1, importance: 5 }, // Women belong home - DISAGREE
    { agreement: 5, importance: 5 }, // All property by state - AGREE (socialist)
    { agreement: 1, importance: 5 }, // Taxation is theft - DISAGREE
    { agreement: 5, importance: 4 }, // Cannabis legalized - AGREE
    { agreement: 5, importance: 4 }, // Voting compulsory - AGREE
  ]);

  // bob_disagrees: Generally disagrees with progressive viewpoints, high importance
  addResponses("bob_disagrees", [0, 1, 4, 8, 9, 14, 18, 25, 26, 27, 29, 32, 33, 35, 36], [
    { agreement: 5, importance: 5 }, // Trump is force for good - AGREE
    { agreement: 1, importance: 5 }, // LGBT discrimination - DISAGREE
    { agreement: 1, importance: 5 }, // Transatlantic slave trade - LOW importance
    { agreement: 1, importance: 5 }, // Racial discrimination - DISAGREE
    { agreement: 5, importance: 5 }, // Non-binary genders not real - AGREE
    { agreement: 1, importance: 5 }, // Children indoctrinated - AGREE
    { agreement: 5, importance: 5 }, // All achievements by men - AGREE
    { agreement: 1, importance: 4 }, // DEI policies needed - DISAGREE
    { agreement: 1, importance: 3 }, // E-sports real sports - DISAGREE
    { agreement: 1, importance: 4 }, // Pets indoors - DISAGREE
    { agreement: 5, importance: 5 }, // Women belong home - AGREE
    { agreement: 1, importance: 5 }, // All property by state - DISAGREE
    { agreement: 5, importance: 5 }, // Taxation is theft - AGREE
    { agreement: 1, importance: 3 }, // Cannabis legalized - DISAGREE
    { agreement: 1, importance: 4 }, // Voting compulsory - DISAGREE
  ]);

  // carol_moderate: Takes middle ground
  addResponses("carol_moderate", [0, 1, 4, 8, 9, 14, 18, 25, 26, 27, 29, 32, 33, 35, 36], [
    { agreement: 3, importance: 3 }, // Trump - neutral
    { agreement: 4, importance: 4 }, // LGBT discrimination - somewhat agree
    { agreement: 3, importance: 3 }, // Transatlantic slave trade - neutral
    { agreement: 4, importance: 4 }, // Racial discrimination - somewhat agree
    { agreement: 2, importance: 3 }, // Non-binary - slight disagree
    { agreement: 3, importance: 3 }, // Children indoctrinated - neutral
    { agreement: 2, importance: 3 }, // All achievements by men - disagree
    { agreement: 3, importance: 3 }, // DEI policies - neutral
    { agreement: 3, importance: 2 }, // E-sports - neutral
    { agreement: 4, importance: 2 }, // Pets indoors - somewhat agree
    { agreement: 2, importance: 4 }, // Women home - disagree
    { agreement: 2, importance: 3 }, // All property by state - disagree
    { agreement: 3, importance: 4 }, // Taxation - neutral
    { agreement: 4, importance: 3 }, // Cannabis - somewhat agree
    { agreement: 3, importance: 3 }, // Voting compulsory - neutral
  ]);

  // david_active: Opinionated, ready for rumbles
  addResponses("david_active", [2, 3, 5, 6, 10, 11, 12, 15, 20, 21, 22, 24, 28, 31], [
    { agreement: 1, importance: 5 }, // Pineapple on pizza - DISAGREE (STRONG)
    { agreement: 5, importance: 5 }, // Climate change important - AGREE
    { agreement: 1, importance: 5 }, // Government welfare burdensome - DISAGREE
    { agreement: 1, importance: 5 }, // Global communism desirable - DISAGREE
    { agreement: 1, importance: 4 }, // Toilet paper over - AGREE
    { agreement: 5, importance: 5 }, // Earth is round - AGREE
    { agreement: 1, importance: 5 }, // Vaccines cause autism - DISAGREE
    { agreement: 1, importance: 5 }, // Some people more rights - DISAGREE
    { agreement: 5, importance: 4 }, // Rap is art form - AGREE
    { agreement: 2, importance: 3 }, // Things better in old days - DISAGREE
    { agreement: 1, importance: 3 }, // Men better drivers - DISAGREE
    { agreement: 3, importance: 4 }, // Animal testing necessary - NEUTRAL
    { agreement: 5, importance: 4 }, // AI replace workers - AGREE
    { agreement: 4, importance: 4 }, // Parents monitor children - AGREE
  ]);

  // emma_passive: Few responses, selective
  addResponses("emma_passive", [2, 11, 12, 28, 37, 38], [
    { agreement: 4, importance: 2 }, // Pineapple on pizza - somewhat agree
    { agreement: 5, importance: 5 }, // Earth is round - AGREE
    { agreement: 1, importance: 2 }, // Vaccines cause autism - DISAGREE
    { agreement: 5, importance: 3 }, // AI replace workers - AGREE
    { agreement: 4, importance: 4 }, // Shoplifting always wrong - AGREE
    { agreement: 2, importance: 3 }, // Suicide legalization - DISAGREE
  ]);

  // frank_blocked: Standard responses
  addResponses("frank_blocked", [1, 3, 8, 20, 24, 26, 29, 35], [
    { agreement: 5, importance: 4 }, // LGBT discrimination - AGREE
    { agreement: 5, importance: 4 }, // Climate change - AGREE
    { agreement: 4, importance: 4 }, // Racial discrimination - AGREE
    { agreement: 5, importance: 3 }, // Rap is art - AGREE
    { agreement: 3, importance: 4 }, // Animal testing - NEUTRAL
    { agreement: 5, importance: 4 }, // DEI policies - AGREE
    { agreement: 1, importance: 5 }, // Women home - DISAGREE
    { agreement: 5, importance: 4 }, // Cannabis legalized - AGREE
  ]);

  // grace_blocker: Progressive responses
  addResponses("grace_blocker", [0, 1, 4, 8, 26, 27, 32, 35, 36, 44, 45], [
    { agreement: 1, importance: 5 }, // Trump - DISAGREE
    { agreement: 5, importance: 5 }, // LGBT discrimination - AGREE
    { agreement: 5, importance: 5 }, // Transatlantic slavery - AGREE
    { agreement: 5, importance: 4 }, // Racial discrimination - AGREE
    { agreement: 1, importance: 5 }, // Non-binary not real - DISAGREE
    { agreement: 5, importance: 4 }, // DEI policies - AGREE
    { agreement: 5, importance: 5 }, // Property by state - AGREE
    { agreement: 5, importance: 4 }, // Cannabis - AGREE
    { agreement: 5, importance: 4 }, // Voting compulsory - AGREE
    { agreement: 5, importance: 3 }, // Online dating ruined - AGREE
    { agreement: 5, importance: 4 }, // Social media addictive - AGREE
  ]);

  // henry_inactive: Minimal responses
  addResponses("henry_inactive", [11, 12], [
    { agreement: 5, importance: 1 }, // Earth round - agree
    { agreement: 1, importance: 2 }, // Vaccines autism - disagree
  ]);

  // iris_suspended: Some responses
  addResponses("iris_suspended", [5, 6, 7, 15, 16], [
    { agreement: 5, importance: 3 }, // Government welfare - AGREE
    { agreement: 5, importance: 4 }, // Communism desirable - AGREE
    { agreement: 5, importance: 5 }, // Men in dresses - AGREE
    { agreement: 2, importance: 3 }, // Some people more rights - DISAGREE
    { agreement: 3, importance: 2 }, // Inequality impossible - NEUTRAL
  ]);

  // jack_response_heavy: Responds to most statements (create 25+ responses)
  // This user will have shared responses with alice and bob
  addResponses("jack_response_heavy", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], [
    { agreement: 5, importance: 4 }, // Trump
    { agreement: 5, importance: 5 }, // LGBT discrimination
    { agreement: 1, importance: 2 }, // Pineapple pizza
    { agreement: 5, importance: 5 }, // Climate change
    { agreement: 5, importance: 4 }, // Slavery
    { agreement: 1, importance: 3 }, // Welfare burden
    { agreement: 1, importance: 3 }, // Communism
    { agreement: 1, importance: 4 }, // Men in dresses
    { agreement: 5, importance: 5 }, // Racial discrimination
    { agreement: 1, importance: 4 }, // Non-binary not real
    { agreement: 1, importance: 2 }, // Toilet paper over
    { agreement: 5, importance: 5 }, // Earth round
    { agreement: 1, importance: 5 }, // Vaccines autism
    { agreement: 1, importance: 3 }, // Covid lab origin
    { agreement: 1, importance: 4 }, // Children indoctrination
    { agreement: 2, importance: 3 }, // Some people more rights
    { agreement: 2, importance: 2 }, // Equality impossible
    { agreement: 1, importance: 4 }, // Right-wing populism
    { agreement: 1, importance: 3 }, // Men achievements
    { agreement: 5, importance: 3 }, // Elon Musk brilliant
    { agreement: 5, importance: 2 }, // Rap is art
    { agreement: 2, importance: 2 }, // Old days better
    { agreement: 2, importance: 2 }, // Men better drivers
    { agreement: 3, importance: 4 }, // Animal testing
    { agreement: 5, importance: 4 }, // Abortion available
  ]);

  // karen_response_light: Selective responses
  addResponses("karen_response_light", [1, 4, 8, 11, 12, 20, 25], [
    { agreement: 4, importance: 3 }, // LGBT discrimination
    { agreement: 4, importance: 4 }, // Slavery
    { agreement: 3, importance: 3 }, // Racial discrimination
    { agreement: 5, importance: 5 }, // Earth round
    { agreement: 1, importance: 4 }, // Vaccines autism
    { agreement: 5, importance: 3 }, // Rap is art
    { agreement: 4, importance: 4 }, // DEI policies
  ]);

  // leo_test_user: Additional responses
  addResponses("leo_test_user", [2, 6, 11, 15, 27, 33, 43], [
    { agreement: 3, importance: 3 }, // Pineapple
    { agreement: 1, importance: 4 }, // Communism
    { agreement: 5, importance: 5 }, // Earth round
    { agreement: 1, importance: 3 }, // Some people rights
    { agreement: 5, importance: 4 }, // E-sports real
    { agreement: 5, importance: 4 }, // Taxation theft
    { agreement: 3, importance: 3 }, // Parents monitor online
  ]);

  if (createResponses.length > 0) {
    await knex("responses").insert(createResponses);
  }
}
