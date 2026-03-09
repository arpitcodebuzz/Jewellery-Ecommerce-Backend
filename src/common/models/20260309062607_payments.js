/**
 * @param {import("knex").Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable("payments", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("order_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE");

    table
      .enu("payment_gateway", ["razorpay", "stripe", "cashfree", "manual"], {
        useNative: false,
        enumName: "payment_gateway_enum",
      })
      .notNullable()
      .defaultTo("razorpay");

    table
      .enu(
        "payment_method",
        ["card", "upi", "netbanking", "wallet", "cod", "unknown"],
        {
          useNative: false,
          enumName: "payment_method_enum",
        }
      )
      .nullable()
      .defaultTo("unknown");

    table.decimal("amount", 14, 2).notNullable();

    table
      .enu("status", ["pending", "success", "failed", "refunded"], {
        useNative: false,
        enumName: "payment_status_enum",
      })
      .notNullable()
      .defaultTo("pending");

    table.string("transaction_id", 150).nullable().unique();
    table.string("gateway_order_id", 150).nullable().unique();
    table.string("gateway_payment_id", 150).nullable().unique();
    table.text("gateway_response").nullable();

    table.timestamp("paid_at").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index(["order_id"], "idx_payments_order_id");
    table.index(["status"], "idx_payments_status");
  });
}

/**
 * @param {import("knex").Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("payments");
}