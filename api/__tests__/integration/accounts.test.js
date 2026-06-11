import request from "supertest";
import app from "../../../app.js";
import testDb from "../setup/testDb.js";

// NOTE: This is an example test, it does not conform to our actual database schema
// this test uses supertest to make an HTTP request to the app, which is a more realistic test of the API endpoints, as it tests the entire request-response cycle, including routing, middleware, controllers, and models, and it also allows us to make assertions about the actual HTTP response that would be sent to a client
// the describe function groups related tests together, in this case all tests related to the Accounts API
describe("Accounts API", () => {
  // a second describe block can be used to group tests related to a specific endpoint or functionality, in this case the signup endpoint
  describe("POST /accounts/signup", () => {
    // the test function defines an individual test case, and provides a description of what the test is doing
    test("signup creates a new account", async () => {
      // the request function from supertest is used to make an HTTP request to the app and the response is stored in a variable
      const response = await request(app).post("/accounts/signup").send({
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
      });

      // assertions are made about the response using Jest's expect function, in this case we are checking that the status code is 201 (created) and that the response body contains the expected properties and values
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("name", "Alice");
      expect(response.body).toHaveProperty("email", "alice@example.com");
      
      // after the request is made, we can also check the database to see if the account was actually created, which is an important part of testing the API's functionality, as it verifies that the controller is correctly interacting with the model and that the data is being stored in the database as expected
      const newAccount = await testDb("accounts")
        .where({ email: "alice@example.com" })
        .first();

      expect(newAccount).toBeDefined();
      expect(newAccount.name).toBe("Alice");
      expect(newAccount.email).toBe("alice@example.com");
    });
  });
});
