import testDb from "../../setup/testDb";
import {
  fetchSharedResponses_model,
  upsertResponse_model,
  deleteResponse_model,
  listResponses_model,
  listUsersWhoResponded_model,
} from "../../../src/models/responses.js";

	describe("fetchSharedResponses", () => {
		test("returns only responses where both users answered the same statement", async () => {
            await seedUser(testDb, { id: userId });
            await seedUser(testDb, { id: otherUserId });
            await seedResponse(testDb, { user_id: userId, statement_id: statementId });
            await seedResponse(testDb, { user_id: userId, statement_id: otherStatementId });
            await seedResponse(testDb, { user_id: otherUserId, statement_id: statementId });

			const result = await fetchSharedResponses(userId, otherUserId, testDb);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(1);
        });
		test("returns shared responses with the expected score field mapping", async () => {
            await seedUser(testDb, { id: userId });
            await seedUser(testDb, { id: otherUserId });
            await seedResponse(testDb, { user_id: userId, statement_id: statementId });
            await seedResponse(testDb, { user_id: otherUserId, statement_id: statementId });

            const result = await fetchSharedResponses(userId, otherUserId, testDb);
                        expect(result).toHaveLength(1);
            const row = result[0];
                        expect(row).toEqual(
                            expect.objectContaining({
                                statement_id: statementId,
                                user1_agreement_score: expect.any(Number),
                                user1_importance_score: expect.any(Number),
                                user2_agreement_score: expect.any(Number),
                                user2_importance_score: expect.any(Number),
                            }),
                        );
            expect(row.user1_agreement_score).toBeGreaterThanOrEqual(1);
            expect(row.user1_agreement_score).toBeLessThanOrEqual(5);
            expect(row.user1_importance_score).toBeGreaterThanOrEqual(1);
            expect(row.user1_importance_score).toBeLessThanOrEqual(5);
            expect(row.user2_agreement_score).toBeGreaterThanOrEqual(1);
            expect(row.user2_agreement_score).toBeLessThanOrEqual(5);
            expect(row.user2_importance_score).toBeGreaterThanOrEqual(1);
            expect(row.user2_importance_score).toBeLessThanOrEqual(5);
        });
		test("returns an empty array when users have no shared responses", async () => {
            await seedUser(testDb, { id: userId });
            await seedUser(testDb, { id: otherUserId });
            await seedResponse(testDb, { user_id: userId, statement_id: statementId });
            await seedResponse(testDb, { user_id: otherUserId, statement_id: otherStatementId });

            const result = await fetchSharedResponses(userId, otherUserId, testDb);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(0);
        });
		test("returns an empty array when either user has no responses", async () => {
            await seedUser(testDb, { id: userId });
            await seedUser(testDb, { id: otherUserId });
            await seedResponse(testDb, { user_id: userId, statement_id: statementId });

            const result = await fetchSharedResponses(userId, otherUserId, testDb);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(0);
        });
	});

describe("upsertResponse_model", () => {
  test.todo("returns the upserted response object in the correct shape");
  test.todo("creates a new response when none already exist");
  test.todo("updates an existing response when one already exists");
});

describe("deleteResponse_model", () => {
  test.todo("returns the deleted response data");
  test.todo("successfully deletes the response from the database");
});

describe("listResponses_model", () => {
  test.todo("returns all responses associated with the passed user id");
  test.to("returns an empty array when no responses exist");
});

describe("listUsersWhoResponded_model", () => {
  test.todo("returns an array of user ids");
  test.todo(
    "returns only the ids of users who have responses to the statement",
  );
  test.todo("returns an empty array when no users with responses exist");
});
