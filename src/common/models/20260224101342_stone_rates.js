// migrations/20260224154000_create_stone_rates_table.js

export async function up(knex) {
  await knex.schema.createTable("stone_rates", (table) => {
    table.bigIncrements("id").primary();

    table.string("stone_type", 50).notNullable().index(); // diamond, cz, ruby

    table.string("clarity_grade", 20).nullable().index(); // VS1, VVS, SI1 (diamond)
    table.string("color_grade", 20).nullable().index();   // D, E, F, G, H (diamond)

    table.decimal("rate_per_carat", 12, 2).notNullable();

    table.date("effective_from").notNullable();

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    // Prevent duplicate rate entries for same day for same combination
    table.unique(
      ["stone_type", "clarity_grade", "color_grade", "effective_from"],
      "uq_stone_rates_day"
    );
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("stone_rates");
}