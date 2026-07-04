import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import testDb from "./testDb.js";

const MIGRATIONS_DIR = "./src/database/migrations";

// SQLite does not support `ALTER TABLE ... DROP/ADD CONSTRAINT`, which this
// migration relies on (it targets Postgres in production). It only tightens an
// existing CHECK value and creates no tables, so it is safely skipped for the
// SQLite test schema. We exclude it via a custom migration source instead of
// modifying the migration itself.
const SKIPPED_MIGRATIONS = new Set([
  "20260701125300_update_mismatches_shared_responses_check.js",
]);

const testMigrationSource = {
  async getMigrations() {
    return fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith(".js") && !SKIPPED_MIGRATIONS.has(file))
      .sort();
  },
  getMigrationName(migration) {
    return migration;
  },
  async getMigration(migration) {
    const fullPath = path.resolve(MIGRATIONS_DIR, migration);
    return import(pathToFileURL(fullPath).href);
  },
};

beforeAll(async () => {
  await testDb.migrate.latest({ migrationSource: testMigrationSource });

  const hasStatements = await testDb.schema.hasTable("statements");
  if (!hasStatements) {
    await testDb.schema.createTable("statements", (table) => {
      table.uuid("id").primary().defaultTo(testDb.fn.uuid());
      table.text("content").notNullable();
      table.timestamp("created_at").defaultTo(testDb.fn.now());
    });
  }

  const hasResponses = await testDb.schema.hasTable("responses");
  if (!hasResponses) {
    await testDb.schema.createTable("responses", (table) => {
      table.increments("id").primary();
      table.uuid("user_id").notNullable();
      table.uuid("statement_id").notNullable();
      table.integer("value").notNullable();
      table.timestamp("created_at").defaultTo(testDb.fn.now());
    });
  }
});

afterAll(async () => {
  await testDb.destroy();
});
