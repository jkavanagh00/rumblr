/**

Compatibility shim:
This file exists so environments that already recorded
20260612113211_create_questions_table.js in knex_migrations
can still rollback cleanly.
Real table creation lives in 20260612113211_create_statements_table.js.
*/
/**

@param { import("knex").Knex } knex
@returns { Promise<void> }
*/
export async function up(knex) {
  // Intentionally no-op: the statements table is created by
  // 20260612113211_create_statements_table.js.
}
/**

@param { import("knex").Knex } knex
@returns { Promise<void> }
*/
export async function down(knex) {
  // Safe in both old and new environments.
  await knex.schema.dropTableIfExists("statements");
}
