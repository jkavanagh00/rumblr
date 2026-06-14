/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("questions", (table) => {
    // UUID primary key that auto-generates a unique string identifier
    table.uuid("id").primary().defaultTo(knex.fn.uuid());

    // TEXT field for the question text content
    table.text("content").notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTableIfExists("questions");
}
