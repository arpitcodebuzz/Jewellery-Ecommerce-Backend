// migrations/20260224152000_create_product_stone_components_table.js

export async function up(knex) {
  await knex.schema.createTable("product_stone_components", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable()
      .index();

    table.string("stone_type", 50).notNullable(); 
    // diamond, cz, ruby, emerald etc.

    table.string("clarity_grade", 20).nullable(); 
    // VS1, VVS1, SI1 (mainly for diamond)

    table.string("color_grade", 20).nullable(); 
    // G, H, D etc. (mainly for diamond)

    table.string("cut_grade", 20).nullable(); 
    // Excellent, Very Good, Good

    table.decimal("weight_carat", 10, 3).notNullable(); 
    // total carat weight (example 0.250)

    table.integer("piece_count").notNullable().defaultTo(1);

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("product_stone_components");
}