import testDb from "./testDb.js";

beforeAll(async () => {
  await testDb.migrate.latest({ directory: "./src/database/migrations" });

  const hasStatements = await testDb.schema.hasTable('statements');
  if (!hasStatements) {
    await testDb.schema.createTable('statements', (table) => {
      table.uuid('id').primary().defaultTo(testDb.fn.uuid());
      table.text('content').notNullable();
      table.timestamp('created_at').defaultTo(testDb.fn.now());
    });
  }

  const hasResponses = await testDb.schema.hasTable('responses');
  if (!hasResponses) {
    await testDb.schema.createTable('responses', (table) => {
      table.increments('id').primary();
      table.uuid('user_id').notNullable();
      table.uuid('statement_id').notNullable();
      table.integer('value').notNullable();
      table.timestamp('created_at').defaultTo(testDb.fn.now());
    });
  }
});

afterAll(async () => {
  await testDb.destroy();
});