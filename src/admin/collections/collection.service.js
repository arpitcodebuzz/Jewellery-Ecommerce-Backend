import db from '../../common/config/db.js';
import dotenv from 'dotenv';
dotenv.config();



export const addCollection = async (collection) => {
  const {name,slug} = collection;

  const collectionExists = await db('collections').where({name}).first();
  const slugExists = await db('collections').where({slug}).first();

  if(collectionExists) {
    return {
      status: false,
      statusCode: 400,
      message: "Collection name already exists"
    }
  }

  if(slugExists) {
    return {
      status: false,
      statusCode: 400,
      message: "Collection slug already exists"
    }
  }

  await db('collections').insert({name,slug});
  return {
    status: true,
    statusCode: 200,
    message: "Collection added successfully"
  }
};


export const getAllCollections = async () => {
  const collections = await db('collections').select('*');
  return {
    status: true,
    statusCode: 200,
    message: "Collections fetched successfully",
    data: { collections }
  }
};


export const updateCollection = async (id,collection) => {
  const {name,slug} = collection;
  const collectionExists = await db('collections').where({id}).first();

  if(!collectionExists) {
    return {
      status: false,
      statusCode: 404,
      message: "Collection not found"
    }
  }

  //check if the name or slug is already taken by another collection except the one being updated
  const nameExists = await db('collections').where({name}).first();
  const slugExists = await db('collections').where({slug}).first();

  if(nameExists && nameExists.id !== id) {
    return {
      status: false,
      statusCode: 400,
      message: "Collection name already exists"
    }
  }

  if(slugExists && slugExists.id !== id) {
    return {
      status: false,
      statusCode: 400,
      message: "Collection slug already exists"
    }
  }

  await db('collections').where({id}).update({name,slug});
  return {
    status: true,
    statusCode: 200,
    message: "Collection updated successfully"
  }
};



export const deleteCollection = async (id) => {
  const collectionExists = await db('collections').where({id}).first();

  if(!collectionExists) {
    return {
      status: false,
      statusCode: 404,
      message: "Collection not found"
    }
  }

  await db('collections').where({id}).delete();
  return {
    status: true,
    statusCode: 200,
    message: "Collection deleted successfully"
  }
};





