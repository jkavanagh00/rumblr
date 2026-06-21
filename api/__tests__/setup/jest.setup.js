import testDb from "./testDb.js";

beforeAll(async () => {
  await testDb.migrate.latest({ directory: "./src/database/migrations" });
});

afterAll(async () => {
  await testDb.destroy();
});