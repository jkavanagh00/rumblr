import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";


jest.unstable_mockModule("../../src/controllers/statements.js", () => ({
	addStatement_controller: jest.fn(),
	getStatementById_controller: jest.fn(),
	listStatements_controller: jest.fn(),
	updateStatement_controller: jest.fn(),
	deleteStatement_controller: jest.fn(),
}));

const { listStatements_controller, getStatementById_controller, addStatement_controller, updateStatement_controller, deleteStatement_controller } = await import(
	"../../src/controllers/statements.js"
);
const { default: statementsRouter } = await import("../../src/routes/statements.js");

const app = express();
app.use(express.json());
app.use("/statements", statementsRouter);

beforeEach(() => {
	jest.clearAllMocks();
});

const testId = "11111111-1111-4111-8111-111111111111";

describe("statements integration routes", () => {
    describe("GET /statements/:id", () => {
        test("returns a statement by ID", async () => {
            const mockStatement = { id: testId, content: "Statement 1" };
            getStatementById_controller.mockResolvedValue(mockStatement);

            const response = await request(app).get(`/statements/${testId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockStatement);
            expect(getStatementById_controller).toHaveBeenCalledTimes(1);
        });
        test("returns 500 when the controller throws", async () => {
            getStatementById_controller.mockRejectedValue(new Error("Database error"));

            const response = await request(app).get(`/statements/${testId}`);

            expect(response.status).toBe(500);
            expect(getStatementById_controller).toHaveBeenCalledTimes(1);
        });
    });

	describe("GET /statements/list", () => {
		test("returns a list of statements", async () => {
			// Stub the controller so this test isolates router behavior: status code, JSON body, and route wiring.
			const mockStatements = [
				{ id: testId, content: "Statement 1" },
				{ id: "22222222-2222-4222-8222-222222222222", content: "Statement 2" },
			];

			listStatements_controller.mockResolvedValue(mockStatements);

			// Send a real HTTP request through Express to verify GET /statements/list reaches the correct handler.
			const response = await request(app).get("/statements/list");

			// A successful controller response should be returned as a 200 with the same JSON payload.
			expect(response.status).toBe(200);
			expect(response.body).toEqual(mockStatements);
			// This confirms the route actually called the controller rather than bypassing that layer.
			expect(listStatements_controller).toHaveBeenCalledTimes(1);
		});

		test("returns 500 when the controller throws", async () => {
			// Simulate an unexpected controller failure to verify the route's catch block behavior.
			listStatements_controller.mockRejectedValue(new Error("Database error"));

			// The request should still complete cleanly even though the controller rejected.
			const response = await request(app).get("/statements/list");

			// The route is expected to translate thrown errors into a 500 response with an error message body.
			expect(response.status).toBe(500);
			expect(response.body).toEqual({ error: "Database error" });
			// This guards against false positives where the test passes without the controller being invoked.
			expect(listStatements_controller).toHaveBeenCalledTimes(1);
		});
	});
});
