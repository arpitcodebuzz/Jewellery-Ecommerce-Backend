import db from '../../common/config/db.js';
import dotenv from 'dotenv';
dotenv.config();
import { calculatePricesForProductList } from '../../common/utils/pricing/price.batch.service.js';


export const createProduct = async (payload) => {
  // Normalize
  const sku = String(payload.sku || "").trim().toUpperCase();
  const name = String(payload.name || "").trim();

  // 1) category must exist
  const category = await db("categories").where({ id: payload.category_id }).first();
  if (!category) {
    return { status:false, statusCode: 404, message: "Category not found" };
  }

  // 2) collection must exist if provided
  const collectionId =
    payload.collection_id === "" || payload.collection_id === 0
      ? null
      : payload.collection_id ?? null;

  if (collectionId !== null) {
    const collection = await db("collections").where({ id: collectionId }).first();
    if (!collection) {
      return { status:false, statusCode: 404, message: "Collection not found" };
    }
  }


  // 3) check if the product name is already exist in category 
  const product = await db("products").where({ name, category_id: payload.category_id }).first();
  if (product) {
    return { status:false, statusCode: 409, message: "Product name already exists in this category" };
  }

  // 4) sku unique (quick check)
  const exists = await db("products").where({ sku }).first();
  if (exists) {
    return { status:false, statusCode: 409, message: "SKU already exists" };
  }

  try {
    const [id] = await db("products").insert({
      name,
      sku,
      product_type: payload.product_type,
      target_gender: payload.target_gender,
      category_id: payload.category_id,
      collection_id: collectionId,
      default_metal_type: payload.default_metal_type,
      making_charge_type: payload.making_charge_type,
      making_charge_value: payload.making_charge_value,
      wastage_percent: payload.wastage_percent ?? 0,
      margin_percent: payload.margin_percent ?? 0,
      gst_percent: payload.gst_percent ?? 3,
      status: payload.status ?? "active",
    });

    const product = await db("products").where({ id }).first();
    return { status:true, statusCode: 201, data: product };
  } catch (err) {
    // 4) handle duplicate race condition (MySQL)
    // ER_DUP_ENTRY = 1062
    if (err && err.errno === 1062) {
      return { status:false, statusCode: 409, message: "SKU already exists" };
    }

    // FK fails (ER_NO_REFERENCED_ROW_2 = 1452) - backup safety
    if (err && err.errno === 1452) {
      return { status:false, statusCode: 400, message: "Invalid category/collection reference" };
    }

    console.error("createProduct error:", err);
    return { status:false, statusCode: 500, message: "Failed to create product" };
  }
};





export const listProducts = async (query) => {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "10", 10), 1), 100);
  const offset = (page - 1) * limit;

  // Base query (for filters + count)
  const baseQuery = db("products")
    .leftJoin("categories", "categories.id", "products.category_id")
    .leftJoin("collections", "collections.id", "products.collection_id");

  // Filters
  if (query.status) baseQuery.where("products.status", query.status);
  if (query.category_id) baseQuery.where("products.category_id", Number(query.category_id));
  if (query.collection_id) baseQuery.where("products.collection_id", Number(query.collection_id));
  if (query.product_type) baseQuery.where("products.product_type", query.product_type);
  if (query.target_gender) baseQuery.where("products.target_gender", query.target_gender);
  if (query.default_metal_type) baseQuery.where("products.default_metal_type", query.default_metal_type);

  // Search (name OR sku)
  if (query.search && String(query.search).trim()) {
    const s = `%${String(query.search).trim()}%`;
    baseQuery.andWhere((builder) => {
      builder.where("products.name", "like", s).orWhere("products.sku", "like", s);
    });
  }

  // Count
  const countRow = await baseQuery
    .clone()
    .clearSelect()
    .clearOrder()
    .count({ total: "products.id" })
    .first();

  const total = Number(countRow?.total || 0);

  // Rows (only this page)
  const rows = await baseQuery
    .clone()
    .select(
      "products.*",
      db.ref("categories.name").as("category_name"),
      db.ref("collections.name").as("collection_name")
    )
    .orderBy("products.id", "desc")
    .limit(limit)
    .offset(offset);

  // If no data
  if (!rows.length) {
    return {
      status: true,
      statusCode: 200,
      data: [],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  const productIds = rows.map((p) => p.id);

  // ✅ Fetch metals (ONE query)
  const metalRows = await db("product_metal_components")
    .whereIn("product_id", productIds)
    .select(
      "id",
      "product_id",
      "metal_type",
      "purity_code",
      "purity_value",
      "weight_grams",
      "is_primary"
    )
    .orderBy("id", "asc");

  // ✅ Fetch stones (ONE query)
  const stoneRows = await db("product_stone_components")
    .whereIn("product_id", productIds)
    .select(
      "id",
      "product_id",
      "stone_type",
      "clarity_grade",
      "color_grade",
      "cut_grade",
      "weight_carat",
      "piece_count"
    )
    .orderBy("id", "asc");

  // Group metals by product_id
  const metalsByProduct = new Map();
  for (const m of metalRows) {
    if (!metalsByProduct.has(m.product_id)) metalsByProduct.set(m.product_id, []);
    metalsByProduct.get(m.product_id).push(m);
  }

  // Group stones by product_id
  const stonesByProduct = new Map();
  for (const s of stoneRows) {
    if (!stonesByProduct.has(s.product_id)) stonesByProduct.set(s.product_id, []);
    stonesByProduct.get(s.product_id).push(s);
  }

  // ✅ Calculate prices in batch (ONE function call)
  // For listing: quantity = 1
  // Optional shipping_state (for GST split)
  const storeState = query.store_state ? String(query.store_state) : "Gujarat";
  const shippingState = query.shipping_state ? String(query.shipping_state) : null;

  const priceMap = await calculatePricesForProductList(productIds, {
    quantity: 1,
    storeState,
    shippingState,
  });

  // Attach metals + stones + flags + price
  const enriched = rows.map((p) => {
    const metals = metalsByProduct.get(p.id) || [];
    const stones = stonesByProduct.get(p.id) || [];
    const price = priceMap.get(p.id) || null;

    return {
      ...p,
      metals,
      stones,
      // quick flags for frontend/admin UI
      flags: {
        metal_added: metals.length > 0,
        stone_added: stones.length > 0,
      },
      // full price breakdown (or null if cannot compute)
      price,
    };
  });

  return {
    status: true,
    statusCode: 200,
    data: enriched,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};



export const getProductById = async (id) => {
  const product = await db("products")
    .select(
      "products.*",
      "categories.name as category_name",
      "collections.name as collection_name"
    )
    .leftJoin("categories", "categories.id", "products.category_id")
    .leftJoin("collections", "collections.id", "products.collection_id")
    .where("products.id", id)
    .first();

  if (!product) return { status:false, statusCode: 404, message: "Product not found" };

  // (Optional) include related data (images/metals/stones) later
  return { status:true, statusCode: 200, data: product };
};



export const updateProduct = async (id, payload) => {
  const existing = await db("products").where({ id }).first();
  if (!existing) return { status:false, statusCode: 404, message: "Product not found" };

  // Normalize if present
  const name = payload.name !== undefined ? String(payload.name).trim() : undefined;
  const sku = payload.sku !== undefined ? String(payload.sku).trim().toUpperCase() : undefined;

  // If category_id change -> must exist
  if (payload.category_id) {
    const category = await db("categories").where({ id: payload.category_id }).first();
    if (!category) return { status:false, statusCode: 404, message: "Category not found" };
  }

  // collection check if provided (allow null)
  let collectionId = undefined;
  if (payload.collection_id !== undefined) {
    collectionId =
      payload.collection_id === "" || payload.collection_id === 0
        ? null
        : payload.collection_id ?? null;

    if (collectionId !== null) {
      const collection = await db("collections").where({ id: collectionId }).first();
      if (!collection) return { status:false, statusCode: 404, message: "Collection not found" };
    }
  }

  // Duplicate product name in category (only if name/category changed)
  const finalCategoryId = payload.category_id ?? existing.category_id;
  if (name !== undefined) {
    const dup = await db("products")
      .where({ name, category_id: finalCategoryId })
      .andWhereNot({ id })
      .first();
    if (dup) {
      return {
        status:false,
        statusCode: 409,
        message: "Product name already exists in this category",
      };
    }
  }

  // SKU unique check if changed
  if (sku !== undefined && sku !== existing.sku) {
    const dupSku = await db("products").where({ sku }).first();
    if (dupSku) return { status:false, statusCode: 409, message: "SKU already exists" };
  }

  try {
    await db("products")
      .where({ id })
      .update({
        ...(name !== undefined ? { name } : {}),
        ...(sku !== undefined ? { sku } : {}),
        ...(payload.product_type !== undefined ? { product_type: payload.product_type } : {}),
        ...(payload.target_gender !== undefined ? { target_gender: payload.target_gender } : {}),
        ...(payload.category_id !== undefined ? { category_id: payload.category_id } : {}),
        ...(payload.collection_id !== undefined ? { collection_id: collectionId } : {}),
        ...(payload.default_metal_type !== undefined ? { default_metal_type: payload.default_metal_type } : {}),
        ...(payload.making_charge_type !== undefined ? { making_charge_type: payload.making_charge_type } : {}),
        ...(payload.making_charge_value !== undefined ? { making_charge_value: payload.making_charge_value } : {}),
        ...(payload.wastage_percent !== undefined ? { wastage_percent: payload.wastage_percent } : {}),
        ...(payload.margin_percent !== undefined ? { margin_percent: payload.margin_percent } : {}),
        ...(payload.gst_percent !== undefined ? { gst_percent: payload.gst_percent } : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
      });

    const updated = await db("products").where({ id }).first();
    return { status:true, statusCode: 200, data: updated };
  } catch (err) {
    if (err && err.errno === 1062) {
      return { status:false, statusCode: 409, message: "Duplicate value (SKU/unique field)" };
    }
    if (err && err.errno === 1452) {
      return { status:false, statusCode: 400, message: "Invalid category/collection reference" };
    }

    console.error("updateProduct error:", err);
    return { status:false, statusCode: 500, message: "Failed to update product" };
  }
};



export const updateProductStatus = async (id, status) => {
  const existing = await db("products").where({ id }).first();
  if (!existing) return { status:false, statusCode: 404, message: "Product not found" };

  await db("products").where({ id }).update({ status });
  const updated = await db("products").where({ id }).first();

  return { status:true, statusCode: 200, data: updated };
};



export const deleteProduct = async (id) => {
  const existing = await db("products").where({ id }).first();
  if (!existing) return { status:false, statusCode: 404, message: "Product not found" };

  // Hard delete (images/metals/stones cascade)
  await db("products").where({ id }).del();

  return { status:true, statusCode: 200, message: "Product deleted successfully" };
};












