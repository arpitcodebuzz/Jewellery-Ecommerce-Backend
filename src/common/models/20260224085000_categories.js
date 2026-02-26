// migrations/20260224143000_create_categories_table.js

export async function up(knex) {
  await knex.schema.createTable("categories", (table) => {
    table.bigIncrements("id").primary();

    table.string("name", 100).notNullable();

    table.string("slug", 120).notNullable().unique();

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("categories");
}