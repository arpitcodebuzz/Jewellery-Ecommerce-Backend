export function up(knex) {
  return knex.schema.createTable("user_otps", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.string("otp", 6).notNullable();
    table
      .enu("purpose", [
        "VERIFY_EMAIL",
        "FORGOT_PASSWORD",
      ])
      .notNullable();
    table.integer("attempts").defaultTo(0);
    table.dateTime("expires_at").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
  });
}

export function down(knex) {
  return knex.schema.dropTable("user_otps");
}
