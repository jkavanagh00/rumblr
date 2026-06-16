/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function up(knex) {
  return knex.schema.createTable("mismatches", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("user1_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.uuid("user2_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.integer("mismatch_score").notNullable();
    table.integer("shared_responses").notNullable();
    table.string("confidence").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).onUpdate(knex.fn.now()).notNullable();

    // add unique constraint to prevent duplicate mismatches between the same pair of users
    table.unique(["user1_id", "user2_id"], "mismatch_unique_user_pair");

    // add indexes on user1_id and user2_id for faster lookups
    table.index(["user1_id"], "mismatch_user1_id_index");
    table.index(["user2_id"], "mismatch_user2_id_index");
    table.index(["mismatch_score"], "mismatch_score_index");

    // add a check constraint to ensure user1_id and user2_id are not the same
    table.check("user1_id <> user2_id"); 
    // add a check constraint to enforce a consistent ordering of user IDs to prevent duplicate pairs in reverse order
    table.check("user1_id < user2_id");     
    // add a check constraint to ensure mismatch_score is between 0 and 100
    table.check("mismatch_score >= 0 AND mismatch_score <= 100");
    // add a check constraint to ensure confidence is one of the allowed values
    table.check("confidence IN ('low', 'medium', 'high')");
    // add a check constraint to ensure shared_responses is above the minimum threshold for a valid mismatch
    table.check("shared_responses >= 20");
});
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTableIfExists("mismatches");
}
