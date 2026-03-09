import db from "../../common/config/db.js";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const sanitizeCartItem = (row) => {
  if (!row) return row;

  return {
    id: row.id,
    cart_id: row.cart_id,
    product_id: row.product_id,
    quantity: Number(row.quantity),
    created_at: row.created_at,
    product: row.product_id
      ? {
          id: row.product_id,
          name: row.product_name,
          sku: row.product_sku,
          product_type: row.product_type,
          target_gender: row.target_gender,
          status: row.product_status,
          image_url: row.image_url || null,
        }
      : null,
  };
};

const getActiveCartByUserId = async (userId, trx = db) => {
  return trx("carts")
    .where({ user_id: userId, status: "active" })
    .orderBy("id", "desc")
    .first();
};

const createCartForUser = async (userId, trx = db) => {
  const [id] = await trx("carts").insert({
    user_id: userId,
    status: "active",
  });

  return trx("carts").where({ id }).first();
};

const getOrCreateActiveCart = async (userId, trx = db) => {
  let cart = await getActiveCartByUserId(userId, trx);

  if (!cart) {
    cart = await createCartForUser(userId, trx);
  }

  return cart;
};

const getProductById = async (productId, trx = db) => {
  return trx("products")
    .where({ id: productId })
    .first();
};

const getCartItemByIdForUser = async (itemId, userId, trx = db) => {
  return trx("cart_items as ci")
    .join("carts as c", "c.id", "ci.cart_id")
    .where("ci.id", itemId)
    .andWhere("c.user_id", userId)
    .andWhere("c.status", "active")
    .select("ci.*", "c.user_id", "c.status as cart_status")
    .first();
};

const getCartItemsWithProductDetails = async (cartId, trx = db) => {
  return trx("cart_items as ci")
    .leftJoin("products as p", "p.id", "ci.product_id")
    .leftJoin("product_images as pi", function () {
      this.on("pi.product_id", "=", "p.id");
    })
    .where("ci.cart_id", cartId)
    .select(
      "ci.id",
      "ci.cart_id",
      "ci.product_id",
      "ci.quantity",
      "ci.created_at",
      "p.name as product_name",
      "p.sku as product_sku",
      "p.product_type",
      "p.target_gender",
      "p.status as product_status",
      "pi.image_url"
    )
    .groupBy(
      "ci.id",
      "ci.cart_id",
      "ci.product_id",
      "ci.quantity",
      "ci.created_at",
      "p.name",
      "p.sku",
      "p.product_type",
      "p.target_gender",
      "p.status",
      "pi.image_url"
    )
    .orderBy("ci.id", "desc");
};


export const addItemToCartService = async(userId,payload) =>{
  const trx = await db.transaction();
  try {

    const product = await getProductById(payload.product_id, trx);

    if(!product) return { status: false, statusCode: 404, message: "Product not found" };

    if(product.status !== "active") return { status: false, statusCode: 400, message: "Product is not active" };

    const cart = await getOrCreateActiveCart(userId, trx);

    const existingIt = await trx("cart_items").where({ cart_id: cart.id, product_id: payload.product_id }).first();

    if(existingIt){
      const newQuantity = Number(existingIt.quantity) + Number(payload.quantity);

      await trx("cart_items").where({ id: existingIt.id }).update({ quantity: newQuantity });

      await trx.commit();

      return { status: true, statusCode: 200, message: "Item quantity updated successfully" };
    }

    await trx("cart_items").insert({
      cart_id: cart.id,
      product_id: payload.product_id,
      quantity: payload.quantity,
    });

    await trx.commit();

    return { status: true, statusCode: 200, message: "Item added to cart successfully" };
    
  } catch (error) {
   trx.rollback();
   return { status: false, statusCode: 400, message: error.message };
  }
}


export const getMyCartService = async(userId) =>{
  const cart = await getActiveCartByUserId(userId);

  if(!cart) return { status: false, statusCode: 404, message: "Cart not found" };

  const items = await getCartItemsWithProductDetails(cart.id);

  return { status: true, statusCode: 200, data: { cart_id: cart.id, status: cart.status, items:items.map(sanitizeCartItem),total_items:items.length } };

}



export const updateCartItemService =async (itemId,userId,payload) =>{
  const trx = await db.transaction();
  try {
    const existingItem = await getCartItemByIdForUser(itemId, userId, trx);

    if(!existingItem) return { status: false, statusCode: 404, message: "Cart Item not found" };

    await trx("cart_items").where({id:itemId}).update({quantity:payload.quantity});

    await trx.commit();

    return { status: true, statusCode: 200, message: "Item quantity updated successfully" };
  }catch (error) {
    trx.rollback();
    return { status: false, statusCode: 400, message: error.message };
  }
}


export const deleteCartItemService = async (itemId,userId) =>{
  const trx = await db.transaction();

  try {

    const existingItem = await getCartItemByIdForUser(itemId, userId, trx);

    if(!existingItem) return { status: false, statusCode: 404, message: "Cart Item not found" };

    await trx("cart_items").where({id:itemId}).del();

    await trx.commit();

    return { status: true, statusCode: 200, message: "Item deleted successfully" };
    
  } catch (error) {
    await trx.rollback();
    return { status: false, statusCode: 400, message: error.message };
  }
}


export const clearCartService = async(userId)=>{

  const trx = await db.transaction();

  try {
    const cart = await getActiveCartByUserId(userId, trx);

    if(!cart) return { status: false, statusCode: 404, message: "Cart is already empty" };

    await trx("cart_items").where({cart_id:cart.id}).del();

    await trx.commit();

    return { status: true, statusCode: 200, message: "Cart cleared successfully" };

  } catch (error) {
    await trx.rollback();
    return { status: false, statusCode: 400, message: error.message };
  }
}