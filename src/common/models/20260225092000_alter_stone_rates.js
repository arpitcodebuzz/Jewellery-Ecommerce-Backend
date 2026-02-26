// migrations/20260225_000001_alter_stone_rates_table.js

export async function up(knex) {
  await knex.schema.alterTable("stone_rates", (table) => {
    // optional future-proof
    table.string("cut_grade", 20).nullable().after("color_grade");

    // status so we can deactivate old rates instead of deleting
    table
      .enu("status", ["active", "inactive"])
      .notNullable()
      .defaultTo("active")
      .after("effective_from");

    // updated_at for edits (admin panel)
    table.timestamp("updated_at").nullable().after("created_at");

    // Normalize NULLs so UNIQUE works even when clarity/color are NULL
    table
      .string("clarity_key", 20)
      .notNullable()
      .defaultTo("NA")
      .after("clarity_grade");

    table
      .string("color_key", 20)
      .notNullable()
      .defaultTo("NA")
      .after("color_grade");
  });

  // Backfill keys for existing rows
  await knex("stone_rates").update({
    clarity_key: knex.raw("COALESCE(clarity_grade, 'NA')"),
    color_key: knex.raw("COALESCE(color_grade, 'NA')"),
  });

  // Drop old unique index and add a correct one
  // (If your DB already has it with this name)
  await knex.raw(`
    ALTER TABLE stone_rates
    DROP INDEX uq_stone_rates_day
  `);

  // New unique constraint that works for NULL cases via *_key
  await knex.raw(`
    ALTER TABLE stone_rates
    ADD UNIQUE KEY uq_stone_rates_day (
      stone_type,
      clarity_key,
      color_key,
      effective_from
    )
  `);

  // Composite index for pricing lookups
  await knex.raw(`
    CREATE INDEX idx_stone_rate_lookup
    ON stone_rates (stone_type, clarity_key, color_key, status, effective_from)
  `);
}

export async function down(knex) {
  // remove added index + unique
  await knex.raw(`DROP INDEX idx_stone_rate_lookup ON stone_rates`);
  await knex.raw(`
    ALTER TABLE stone_rates
    DROP INDEX uq_stone_rates_day
  `);

  // restore old unique (best-effort)
  await knex.raw(`
    ALTER TABLE stone_rates
    ADD UNIQUE KEY uq_stone_rates_day (
      stone_type,
      clarity_grade,
      color_grade,
      effective_from
    )
  `);

  await knex.schema.alterTable("stone_rates", (table) => {
    table.dropColumn("cut_grade");
    table.dropColumn("status");
    table.dropColumn("updated_at");
    table.dropColumn("clarity_key");
    table.dropColumn("color_key");
  });
}