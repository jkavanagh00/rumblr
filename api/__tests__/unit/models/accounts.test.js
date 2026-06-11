import testDb from "../../setup/testDb.js";
import Accounts from "../../../src/models/accounts.js";

// NOTE: This is an example test, it does not conform to our actual database schema
// the describe function groups related tests together, in this case all tests related to the Accounts model
describe("Accounts model", () => {
    // it then runs all tests within the describe block, and provides a description of what the test is doing
    test("listAccounts returns an array of accounts", async () => {
        // here, some test data is inserted into the accounts table of the test database, meaning that we are not relying on seed data for our tests, and can control the data that is being tested against
        await testDb("accounts").insert([
            { id: 1, name: "Alice", email: "alice@example.com" },
            { id: 2, name: "Bob", email: "bob@example.com" }
        ]);

        // the actual test is performed by calling the listAccounts function from the Accounts model, and then making assertions about the returned data using Jest's expect function
        const accounts = await Accounts.listAccounts();
        // these assertions may be overkill for a simple test, but they demonstrate how to check that the returned data is in the expected format and contains the expected values
        expect(accounts).toBeInstanceOf(Array);
        expect(accounts).toHaveLength(2);
        expect(accounts).toEqual([
            { id: 1, name: "Alice", email: "alice@example.com" },
            { id: 2, name: "Bob", email: "bob@example.com" }
        ]);
    });
});