/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // SQLite can't ALTER check constraints; fresh SQLite DBs already get
  // shared_responses >= 10 from the create-table migration.
  if (knex.client.config.client === "sqlite3") return;

  await knex.schema.alterTable("mismatches", (table) => {
    table.dropChecks(["mismatches_shared_responses_check"]);
  });

  await knex.schema.alterTable("mismatches", (table) => {
    table.check(
      "shared_responses >= 10",
      [],
      "mismatches_shared_responses_check",
    );
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  if (knex.client.config.client === "sqlite3") return;

  await knex.schema.alterTable("mismatches", (table) => {
    table.dropChecks(["mismatches_shared_responses_check"]);
  });

  await knex.schema.alterTable("mismatches", (table) => {
    table.check(
      "shared_responses >= 20",
      [],
      "mismatches_shared_responses_check",
    );
  });
}
