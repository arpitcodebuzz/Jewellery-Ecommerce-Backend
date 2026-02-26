
import * as Service from "./products_metals.service.js";


const sendResponse = (res, result) => {
  return res.status(result.statusCode).json({
    status: result.status,
    message: result.message,
    data: result.data ?? null
  });
};

export const addProductMetal = async (req, res) => {
  try {
    const result = await Service.addProductMetal(req.params.productId,req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};


export const getAllProductMetals = async (req, res) => {
  try {
    const result = await Service.listProductMetals(req.params.productId);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};

export const updateProductMetal = async (req, res) => {
  try {
    const result = await Service.updateProductMetal(req.params.productId,req.params.metalId, req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};


export const deleteProductMetal = async (req, res) => {
  try {
    const result = await Service.deleteProductMetal(req.params.productId,req.params.metalId);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};