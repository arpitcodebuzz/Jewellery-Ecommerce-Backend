/**
 * @param { import("knex").Knex } knex
 */
export async function up(knex) {
  // =============================
  // CARTS TABLE
  // =============================
  await knex.schema.createTable("carts", (table) => {
    table.bigIncrements("id").primary();

    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table
      .enu("status", ["active", "converted", "abandoned"])
      .notNullable()
      .defaultTo("active");

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index(["user_id", "status"], "idx_carts_user_status");
  });

  // =============================
  // CART ITEMS TABLE
  // =============================
  await knex.schema.createTable("cart_items", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("cart_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("carts")
      .onDelete("CASCADE");

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("products")
      .onDelete("CASCADE");

    table
      .integer("quantity")
      .notNullable()
      .defaultTo(1);

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    // Prevent duplicate same product in same cart
    table.unique(["cart_id", "product_id"], "uq_cart_product");

    table.index(["cart_id"], "idx_cart_items_cart");
    table.index(["product_id"], "idx_cart_items_product");
  });
}

/**
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("cart_items");
  await knex.schema.dropTableIfExists("carts");
}