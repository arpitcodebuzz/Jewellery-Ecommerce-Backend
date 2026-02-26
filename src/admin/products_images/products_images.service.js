import db from '../../common/config/db.js';
import dotenv from 'dotenv';
dotenv.config();
import {deleteMediaFile} from '../../common/utils/deleteImage.js';

export const addProductImage = async (productId, imageUrl) => {
const product = await db("products").where({ id: productId }).first();
if(!product) return { status: false, statusCode: 404, message: "Product not found" };

//we need check that how many how many images product alredy has if image already has 5 images return error
const existingImages = await db("product_images")
  .where({ product_id: productId })
  .count("id as total");

const imageCount = Number(existingImages[0].total);

if(imageCount >= 5) {
  deleteMediaFile(imageUrl);
  return { status: false, statusCode: 400, message: "Product already has 5 images" };
}

await db("product_images").insert({ product_id: productId, image_url: imageUrl });

return { status: true, statusCode: 200, message: "Image added successfully" };

};


export const listProductImages = async (productId) => {
const product = await db("products").where({ id: productId }).first();
if(!product) return { status: false, statusCode: 404, message: "Product not found" };

const rows = await db("product_images").where({ product_id: productId }).orderBy("id", "asc");

return { status: true, statusCode: 200, data: rows };
};

export const deleteProductImage = async (productId, imageId) => {
const product = await db("products").where({ id: productId }).first();
if(!product) return { status: false, statusCode: 404, message: "Product not found" };

const image = await db("product_images").where({ id: imageId, product_id: productId }).first();
if(!image) return { status: false, statusCode: 404, message: "Image not found" };

await db("product_images").where({ id: imageId }).del();

deleteMediaFile(image.image_url);

return { status: true, statusCode: 200, message: "Image deleted successfully" };
};











