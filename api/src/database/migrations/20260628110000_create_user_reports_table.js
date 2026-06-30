/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("user_reports", (table) => {
    // Primary key for each report row.
    table.uuid("id").primary().defaultTo(knex.fn.uuid());

    // The user who submits the report.
    table
      .uuid("reporter_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // The user being reported.
    table
      .uuid("reported_user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Related rumble; set to null if the rumble is removed.
    table
      .uuid("rumble_id")
      .references("id")
      .inTable("rumbles")
      .onDelete("SET NULL");

    // Free-text report details and snapshot of the message history.
    table.text("reason").notNullable();
    table.text("message_log").notNullable();

    // Report lifecycle status and creation timestamp.
    table.enum("status", ["open", "closed"]).notNullable().defaultTo("open");
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Indexes for common admin-review and lookup queries.
    table.index(["reporter_id"]);
    table.index(["reported_user_id"]);
    table.index(["rumble_id"]);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTableIfExists("user_reports");
}
