import db from "../../common/config/db.js";

const ensureProductExists = async (productId) => {
  const product = await db("products").where({ id: productId }).first();
  if (!product) return null;
  return product;
};

export const addProductMetal = async (productId, payload) => {
  const product = await ensureProductExists(productId);
  if (!product) return { status:false, statusCode: 404, message: "Product not found" };

  // If product has no metals yet, first one becomes primary
  const existingCountRow = await db("product_metal_components")
    .where({ product_id: productId })
    .count({ total: "id" })
    .first();

  const existingCount = Number(existingCountRow?.total || 0);

  const requestedPrimary = payload.is_primary === true;
  const shouldBePrimary = existingCount === 0 ? true : requestedPrimary;

  // If setting primary=true, unset others
  await db.transaction(async (trx) => {
    if (shouldBePrimary) {
      await trx("product_metal_components")
        .where({ product_id: productId })
        .update({ is_primary: false });
    }

    await trx("product_metal_components").insert({
      product_id: productId,
      metal_type: payload.metal_type,
      purity_code: payload.purity_code,
      purity_value: payload.purity_value,
      weight_grams: payload.weight_grams,
      is_primary: shouldBePrimary,
    });
  });

  const rows = await db("product_metal_components")
    .where({ product_id: productId })
    .orderBy("is_primary", "desc")
    .orderBy("id", "asc");

  return { status:true, statusCode: 201, data: rows };
};

export const listProductMetals = async (productId) => {
  const product = await ensureProductExists(productId);
  if (!product) return { status:false, statusCode: 404, message: "Product not found" };

  const rows = await db("product_metal_components")
    .where({ product_id: productId })
    .orderBy("is_primary", "desc")
    .orderBy("id", "asc");

  return { status:true, statusCode: 200, data: rows };
};

export const updateProductMetal = async (productId, metalId, payload) => {
  const product = await ensureProductExists(productId);
  if (!product) return { status:false, statusCode: 404, message: "Product not found" };

  const metal = await db("product_metal_components")
    .where({ id: metalId, product_id: productId })
    .first();

  if (!metal) return { status:false, statusCode: 404, message: "Metal component not found" };

  const wantsPrimary = payload.is_primary === true;

  await db.transaction(async (trx) => {
    if (wantsPrimary) {
      await trx("product_metal_components")
        .where({ product_id: productId })
        .update({ is_primary: false });
    }

    await trx("product_metal_components")
      .where({ id: metalId })
      .update({
        ...(payload.metal_type !== undefined ? { metal_type: payload.metal_type } : {}),
        ...(payload.purity_code !== undefined ? { purity_code: payload.purity_code } : {}),
        ...(payload.purity_value !== undefined ? { purity_value: payload.purity_value } : {}),
        ...(payload.weight_grams !== undefined ? { weight_grams: payload.weight_grams } : {}),
        ...(payload.is_primary !== undefined ? { is_primary: payload.is_primary } : {}),
      });
  });

  const rows = await db("product_metal_components")
    .where({ product_id: productId })
    .orderBy("is_primary", "desc")
    .orderBy("id", "asc");

  return { status:true, statusCode: 200, data: rows };
};

export const deleteProductMetal = async (productId, metalId) => {
  const product = await ensureProductExists(productId);
  if (!product) return { status:false, statusCode: 404, message: "Product not found" };

  const metal = await db("product_metal_components")
    .where({ id: metalId, product_id: productId })
    .first();

  if (!metal) return { status:false, statusCode: 404, message: "Metal component not found" };

  await db.transaction(async (trx) => {
    await trx("product_metal_components").where({ id: metalId }).del();

    // If deleted metal was primary, make another one primary (if exists)
    if (metal.is_primary) {
      const next = await trx("product_metal_components")
        .where({ product_id: productId })
        .orderBy("id", "asc")
        .first();

      if (next) {
        await trx("product_metal_components")
          .where({ id: next.id })
          .update({ is_primary: true });
      }
    }
  });

  const rows = await db("product_metal_components")
    .where({ product_id: productId })
    .orderBy("is_primary", "desc")
    .orderBy("id", "asc");

  return { status:true, statusCode: 200, data: rows };
};

