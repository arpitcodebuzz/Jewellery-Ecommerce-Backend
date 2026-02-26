// migrations/20260224150000_create_product_images_table.js

export async function up(knex) {
  await knex.schema.createTable("product_images", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable()
      .index();

    table.string("image_url", 500).notNullable();

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
  await knex.schema.dropTableIfExists("product_images");
}