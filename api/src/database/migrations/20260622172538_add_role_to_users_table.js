/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.alterTable("users", (table) => {
    table.enu("role", ["user", "admin"]).notNullable().defaultTo("user");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function down(knex) {
  return knex.schema.alterTable("users", (table) => {
    table.dropColumn("role");
  });
}
