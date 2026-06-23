import {
	upsertMismatch_model,
	listMismatchesForUser_model,
} from "../../../src/models/mismatches.js";
import testDb from "../../setup/testDb.js";
import {
    seedUser,
    seedResponse,
    seedMismatch
} from "./../../setup/factories.js"

const TABLE = 'mismatches';
const userId = "22222222-2222-4222-8222-222222222222";
const otherUserId = "33333333-3333-4333-8333-333333333333";
const statementId = "44444444-4444-4444-8444-444444444444";
const otherStatementId = "55555555-5555-4555-8555-555555555555"; 

describe("mismatches model", () => {
    beforeEach(async () => {
        await testDb("mismatches").del();
        await testDb("responses").del();
        await testDb("statements").del();
        await testDb("users").del();
    });

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

	describe("upsertMismatch", () => {
		test.todo("inserts a new mismatch row when no existing row is found and shared responses are at least 20");
		test.todo("updates an existing mismatch row when the pair already exists and shared responses are at least 20");
		test.todo("deletes an existing mismatch row when shared responses fall below 20");
		test.todo("does not insert a mismatch row when no existing row is found and shared responses are below 20");
		test.todo("canonicalizes user pair order so reversed input user IDs map to the same mismatch row");
		test.todo("writes mismatch_score, confidence, shared_responses, and updated_at with expected values");
	});

	describe("listMismatchesForUser", () => {
		test.todo("returns mismatch rows where the user appears as user1_id");
		test.todo("returns mismatch rows where the user appears as user2_id");
		test.todo("returns rows ordered by mismatch_score descending");
		test.todo("uses shared_responses descending as the tie-breaker for equal mismatch scores");
		test.todo("returns an empty array when the user has no mismatches");
	});
});
