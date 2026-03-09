// migrations/20260309000100_create_user_addresses_table.js

/**
 * @param {import("knex").Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable("user_addresses", (table) => {
    table.bigIncrements("id").primary();

    // linked user from your auth system
    table.bigInteger("user_id").unsigned().notNullable().index();

    table.string("full_name", 120).notNullable();
    table.string("phone", 20).notNullable();

    table.string("address_line1", 255).notNullable();
    table.string("address_line2", 255).nullable();

    table.string("city", 100).notNullable();
    table.string("state", 100).notNullable();
    table.string("postal_code", 20).notNullable();
    table.string("country", 100).notNullable().defaultTo("India");

    table.boolean("is_default").notNullable().defaultTo(false);

    table
      .enu("address_type", ["home", "work", "other"])
      .notNullable()
      .defaultTo("home");

    table.timestamps(true, true);

    // optional index for faster queries
    table.index(["user_id", "is_default"], "idx_user_addresses_user_default");
  });
}

/**
 * @param {import("knex").Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("user_addresses");
}