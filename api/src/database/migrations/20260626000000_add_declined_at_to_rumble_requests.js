/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .alterTable("rumble_requests", (table) => {
      table.timestamp("declined_at").nullable();
    })
    .then(() =>
      knex("rumble_requests")
        .where({ status: "declined" })
        .whereNull("declined_at")
        .update({ declined_at: knex.raw("created_at") }),
    );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.alterTable("rumble_requests", (table) => {
    table.dropColumn("declined_at");
  });
}
