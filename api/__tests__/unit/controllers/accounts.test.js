import { jest } from "@jest/globals";

// NOTE: This is an example test, it does not conform to our actual database schema
// in controller unit tests, we want to test the controller functions in isolation, without relying on the database or the actual model implementations, so we mock the model functions that the controller depends on
jest.unstable_mockModule("../../../src/models/accounts.js", () => ({
  default: {
    createAccount: jest.fn(),
  },
}));
// dynamic imports are used to import the modules after the mocks have been set up, so that the controller will use the mocked model functions instead of the real ones
const { default: Accounts } = await import("../../../src/models/accounts.js");
const { signup } = await import("../../../src/controllers/accounts.js");

// the describe function groups related tests together, in this case all tests related to the Accounts controller
describe("Accounts controller", () => {
  // beforeEach resets the mock between tests so that calls from one test do not affect another
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // a second describe block can be used to group tests related to a specific function, in this case the signup function
  describe("signup", () => {
    // the test function defines an individual test case, and provides a description of what the test is doing
    test("signup calls createAccount with the correct data and returns 201", async () => {
      // fake req and res objects are created to simulate an HTTP request and response, without needing a running server
      const req = {
        body: { name: "Alice", email: "alice@example.com", password: "password123" },
      };
      // the res object is mocked to have a status and json properties
      // note the use of jest.fn() to create mock functions that we can make assertions about later, such as checking that they were called with the correct arguments
      const res = {
        // by using mockReturnThis, we can chain the status and json calls like in a real Express response object
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // the mock is set up to return a fake account object when createAccount is called
      const fakeAccount = { id: 1, name: "Alice", email: "alice@example.com" };
      // mockResolvedValue is used to specify the value that the mocked createAccount function should return when it is called, in this case a promise that resolves to the fake account object, simulating the behavior of an asynchronous database call
      Accounts.createAccount.mockResolvedValue(fakeAccount);

      // finally, the controller function is called with the fake req and res objects, performing the test itself
      await signup(req, res);

      // assertions are made to check that the model was called with the correct data, and that the response was sent with the correct status code and body
      // the toHaveBeenCalledWith matcher is used to check that the mocked functions created with jest.fn() were called with the expected arguments, which is important for verifying that the controller is interacting with the model and sending the correct response
      expect(Accounts.createAccount).toHaveBeenCalledWith({
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeAccount);
    });
  });
});
