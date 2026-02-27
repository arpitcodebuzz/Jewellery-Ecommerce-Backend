/**
 * @param { import("knex").Knex } knex
 */
export function up(knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();

    table.string("name", 100).nullable();

    table
      .string("email", 150)
      .notNullable()
      .unique();

    table
      .string("google_id", 100)
      .unique()
      .nullable()
      .comment("Google unique user ID (sub)");

    table.string("phone", 15).nullable();

    table
      .string("password", 255)
      .nullable()
      .comment("Null for Google users");

    table
      .boolean("email_verified")
      .defaultTo(false);

    table
      .enum("status", ["Active", "InActive"])
      .defaultTo("Active");

    table
      .enum("provider_Type", ["manual", "google"])
      .defaultTo("manual");

    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 */
export function down(knex) {
  return knex.schema.dropTableIfExists("users");
}
