import knex from "knex";

const testDb = knex({
  client: "sqlite3",
  // this line tells knex to use an in-memory SQLite database for testing
  connection: { filename: ":memory:" },
  useNullAsDefault: true,
});

export default testDb;