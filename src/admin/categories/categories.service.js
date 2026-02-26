import db from '../../common/config/db.js';
import dotenv from 'dotenv';
dotenv.config();


export const addCategory = async (category) => {
  const { name, slug } = category

  const categoryExists = await db('categories').where({ name}).first();
  const slugExists = await db('categories').where({ slug }).first();

  if (categoryExists) {
    return {
      status: false,
      statusCode: 400,
      message: "Category name already exists"
    }
  }

  if(slugExists) {
    return {
      status: false,
      statusCode: 400,
      message: "Category slug already exists"
    }
  }

  await db('categories').insert({ name, slug });
  return {
    status: true,
    statusCode: 200,
    message: "Category added successfully"
  }
};


export const getAllCategories = async () => {
  const categories = await db('categories').select('*');
  return {
    status: true,
    statusCode: 200,
    message: "Categories fetched successfully",
    data: { categories }
  }
};

export const updateCategory = async (id, category) => {
  const { name, slug } = category
  const categoryExists = await db('categories').where({ id }).first();

  if (!categoryExists) {
    return {
      status: false,
      statusCode: 404,
      message: "Category not found"
    }
  }
  // check if the nae is already taken by another category except the one being updated
  const nameExists = await db('categories').where({ name }).first();

  if (nameExists && nameExists.id !== id) {
    return {
      status: false,
      statusCode: 400,
      message: "Category name already exists"
    }
  }

  await db('categories').where({ id }).update({ name, slug });
  return {
    status: true,
    statusCode: 200,
    message: "Category updated successfully"
  }

};


export const deleteCategory = async (id) => {
  const categoryExists = await db('categories').where({ id }).first();

  if (!categoryExists) {
    return {
      status: false,
      statusCode: 404,
      message: "Category not found"
    }
  }

  await db('categories').where({ id }).delete();
  return {
    status: true,
    statusCode: 200,
    message: "Category deleted successfully"
  }
};











