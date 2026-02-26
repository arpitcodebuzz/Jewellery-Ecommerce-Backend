// src/modules/pricing/price.batch.service.js
import db from "../../config/db.js";

/**
 * Normalize null/empty keys so DB lookups are consistent.
 * Make sure your stone_rates table stores these keys too (clarity_key/color_key)
 * OR adapt the query below to use clarity_grade/color_grade directly.
 */
function normalizeKey(v) {
  if (v === null || v === undefined) return "NA";
  const s = String(v).trim();
  return s.length ? s : "NA";
}

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function buildTupleWhereIn(keys, colsCount) {
  // keys is array of arrays e.g. [[a,b],[c,d]]
  // returns { sql: "(col1,col2) in ((?,?),(?,?))", bindings: [...] }
  const tuples = keys.map(() => `(${new Array(colsCount).fill("?").join(",")})`).join(",");
  const sql = `(${tuples})`;
  const bindings = keys.flat();
  return { sql, bindings };
}

/**
 * Fetch latest metal rates for a list of unique (metal_type, purity_code).
 * Uses JOIN with subquery MAX(effective_from) to get latest per combo.
 */
async function fetchLatestMetalRates(metalPairs) {
  // metalPairs: [{ metal_type, purity_code }]
  if (!metalPairs.length) return new Map();

  const tupleKeys = metalPairs.map((x) => [x.metal_type, x.purity_code]);
  const { sql: inTuples, bindings } = buildTupleWhereIn(tupleKeys, 2);

  // You can add ".where('status','active')" if your table has status
  const rows = await db("metal_rates as mr")
    .join(
      db("metal_rates")
        .select("metal_type", "purity_code")
        .max("effective_from as max_date")
        .whereRaw(`(metal_type, purity_code) IN ${inTuples}`, bindings)
        .groupBy("metal_type", "purity_code")
        .as("mx"),
      function joinLatest() {
        this.on("mr.metal_type", "=", "mx.metal_type")
          .andOn("mr.purity_code", "=", "mx.purity_code")
          .andOn("mr.effective_from", "=", "mx.max_date");
      }
    )
    .select("mr.metal_type", "mr.purity_code", "mr.rate_per_gram", "mr.effective_from");

  const map = new Map();
  for (const r of rows) {
    map.set(`${r.metal_type}::${r.purity_code}`, r);
  }
  return map;
}

/**
 * Fetch latest stone rates for a list of unique keys.
 * If your stone_rates table uses clarity_key/color_key, we use those.
 * If not, change clarity_key->clarity_grade and color_key->color_grade in query + key.
 */
async function fetchLatestStoneRates(stoneKeys) {
  // stoneKeys: [{ stone_type, clarity_key, color_key, cut_grade }]
  if (!stoneKeys.length) return new Map();

  const tupleKeys = stoneKeys.map((x) => [
    x.stone_type,
    x.clarity_key,
    x.color_key,
    x.cut_grade, // can be "NA"
  ]);
  const { sql: inTuples, bindings } = buildTupleWhereIn(tupleKeys, 4);

  const rows = await db("stone_rates as sr")
    .join(
      db("stone_rates")
        .select("stone_type", "clarity_key", "color_key", "cut_grade")
        .max("effective_from as max_date")
        .whereRaw(`(stone_type, clarity_key, color_key, cut_grade) IN ${inTuples}`, bindings)
        .groupBy("stone_type", "clarity_key", "color_key", "cut_grade")
        .as("sx"),
      function joinLatest() {
        this.on("sr.stone_type", "=", "sx.stone_type")
          .andOn("sr.clarity_key", "=", "sx.clarity_key")
          .andOn("sr.color_key", "=", "sx.color_key")
          .andOn("sr.cut_grade", "=", "sx.cut_grade")
          .andOn("sr.effective_from", "=", "sx.max_date");
      }
    )
    .select(
      "sr.stone_type",
      "sr.clarity_key",
      "sr.color_key",
      "sr.cut_grade",
      "sr.rate_per_carat",
      "sr.effective_from"
    );

  const map = new Map();
  for (const r of rows) {
    map.set(`${r.stone_type}::${r.clarity_key}::${r.color_key}::${r.cut_grade}`, r);
  }
  return map;
}

/**
 * Batch calculate prices for a list of product IDs.
 *
 * @param {number[]} productIds
 * @param {object} options
 * @param {string} options.shippingState
 * @param {string} options.storeState
 * @param {number} options.quantity default 1 (for listing use 1)
 * @returns {Promise<Map<number, object>>}
 */
export async function calculatePricesForProductList(
  productIds,
  { quantity = 1, shippingState = null, storeState = null } = {}
) {
  const ids = [...new Set((productIds || []).map((x) => Number(x)).filter(Boolean))];
  const out = new Map();
  if (!ids.length) return out;

  // 1) products (only fields needed for pricing)
  const products = await db("products")
    .whereIn("id", ids)
    .select(
      "id",
      "making_charge_type",
      "making_charge_value",
      "wastage_percent",
      "margin_percent",
      "gst_percent",
      "status"
    );

  const productById = new Map(products.map((p) => [p.id, p]));

  // 2) metals for these products
  const metals = await db("product_metal_components")
    .whereIn("product_id", ids)
    .select("product_id", "metal_type", "purity_code", "weight_grams");

  // 3) stones for these products
  const stones = await db("product_stone_components")
    .whereIn("product_id", ids)
    .select(
      "product_id",
      "stone_type",
      "clarity_grade",
      "color_grade",
      "cut_grade",
      "weight_carat"
    );

  // Group metals/stones by product
  const metalsByProduct = new Map();
  for (const m of metals) {
    if (!metalsByProduct.has(m.product_id)) metalsByProduct.set(m.product_id, []);
    metalsByProduct.get(m.product_id).push(m);
  }

  const stonesByProduct = new Map();
  for (const s of stones) {
    if (!stonesByProduct.has(s.product_id)) stonesByProduct.set(s.product_id, []);
    stonesByProduct.get(s.product_id).push(s);
  }

  // 4) Build unique rate lookup keys
  const metalPairSet = new Set();
  const metalPairs = [];
  for (const m of metals) {
    const key = `${m.metal_type}::${m.purity_code}`;
    if (!metalPairSet.has(key)) {
      metalPairSet.add(key);
      metalPairs.push({ metal_type: m.metal_type, purity_code: m.purity_code });
    }
  }

  const stoneKeySet = new Set();
  const stoneKeys = [];
  for (const s of stones) {
    const clarity_key = normalizeKey(s.clarity_grade);
    const color_key = normalizeKey(s.color_grade);
    const cut_grade = normalizeKey(s.cut_grade); // keep consistent with rate table
    const key = `${s.stone_type}::${clarity_key}::${color_key}::${cut_grade}`;
    if (!stoneKeySet.has(key)) {
      stoneKeySet.add(key);
      stoneKeys.push({
        stone_type: s.stone_type,
        clarity_key,
        color_key,
        cut_grade,
      });
    }
  }

  // 5) Fetch latest rates in bulk
  const metalRateMap = await fetchLatestMetalRates(metalPairs);
  const stoneRateMap = await fetchLatestStoneRates(stoneKeys);

  // 6) Calculate per product
  for (const productId of ids) {
    const p = productById.get(productId);

    // If product missing or inactive you can decide to return null instead
    if (!p) {
      out.set(productId, null);
      continue;
    }

    const pMetals = metalsByProduct.get(productId) || [];
    const pStones = stonesByProduct.get(productId) || [];

    let metalCost = 0;
    let totalMetalWeight = 0;
    let stoneCost = 0;

    const missing = {
      metal_rate_missing: false,
      stone_rate_missing: false,
      metal_not_added: pMetals.length === 0,
      stone_not_added: pStones.length === 0,
    };

    // metal cost
    for (const m of pMetals) {
      totalMetalWeight += Number(m.weight_grams || 0);

      const rateRow = metalRateMap.get(`${m.metal_type}::${m.purity_code}`);
      if (!rateRow) {
        missing.metal_rate_missing = true;
        continue; // skip this metal if rate missing
      }

      metalCost += Number(m.weight_grams || 0) * Number(rateRow.rate_per_gram || 0);
    }

    // stone cost
    for (const s of pStones) {
      const clarity_key = normalizeKey(s.clarity_grade);
      const color_key = normalizeKey(s.color_grade);
      const cut_grade = normalizeKey(s.cut_grade);

      const rateRow = stoneRateMap.get(
        `${s.stone_type}::${clarity_key}::${color_key}::${cut_grade}`
      );

      if (!rateRow) {
        missing.stone_rate_missing = true;
        continue; // skip this stone if rate missing
      }

      stoneCost += Number(s.weight_carat || 0) * Number(rateRow.rate_per_carat || 0);
    }

    // making charges
    let makingCharge = 0;
    if (p.making_charge_type === "per_gram") {
      makingCharge = totalMetalWeight * Number(p.making_charge_value || 0);
    } else {
      makingCharge = Number(p.making_charge_value || 0);
    }

    // wastage (as per PRD: based on metal_cost)
    const wastageAmount = metalCost * (Number(p.wastage_percent || 0) / 100);

    const subtotal = metalCost + stoneCost + makingCharge + wastageAmount;

    const marginAmount = subtotal * (Number(p.margin_percent || 0) / 100);

    const beforeGst = subtotal + marginAmount;

    const gstPercent = Number(p.gst_percent || 0);
    const gstAmount = beforeGst * (gstPercent / 100);

    // GST split (optional)
    let cgst = 0,
      sgst = 0,
      igst = 0;

    if (storeState && shippingState && String(storeState).toLowerCase() === String(shippingState).toLowerCase()) {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
    } else {
      igst = gstAmount;
    }

    const unitPrice = beforeGst + gstAmount;
    const totalAmount = unitPrice * Number(quantity || 1);

    out.set(productId, {
      product_id: productId,

      quantity: Number(quantity || 1),

      metal_cost: round2(metalCost),
      stone_cost: round2(stoneCost),
      making_charge: round2(makingCharge),
      wastage_amount: round2(wastageAmount),

      subtotal: round2(subtotal),
      margin_amount: round2(marginAmount),

      gst_percent: gstPercent,
      gst_amount: round2(gstAmount),
      cgst: round2(cgst),
      sgst: round2(sgst),
      igst: round2(igst),

      unit_price: round2(unitPrice),
      total_amount: round2(totalAmount),

      flags: missing, // tells admin/frontend what is missing
    });
  }

  return out;
}