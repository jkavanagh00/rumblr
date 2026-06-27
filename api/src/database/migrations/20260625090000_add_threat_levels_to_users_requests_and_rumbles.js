/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .alterTable("users", (table) => {
      table
        .text("threat_levels")
        .notNullable()
        .defaultTo(JSON.stringify(["green"]));
    })
    .alterTable("rumble_requests", (table) => {
      table
        .enu("threat_level", ["green", "orange", "red"])
        .notNullable()
        .defaultTo("green");
    })
    .alterTable("rumbles", (table) => {
      table
        .enu("threat_level", ["green", "orange", "red"])
        .notNullable()
        .defaultTo("green");
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema
    .alterTable("rumbles", (table) => {
      table.dropColumn("threat_level");
    })
    .alterTable("rumble_requests", (table) => {
      table.dropColumn("threat_level");
    })
    .alterTable("users", (table) => {
      table.dropColumn("threat_levels");
    });
}
