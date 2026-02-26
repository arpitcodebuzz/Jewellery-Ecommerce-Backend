
import * as Service from "./products.service.js";


const sendResponse = (res, result) => {
  return res.status(result.statusCode).json({
    status: result.status,
    message: result.message,
    data: result.data ?? null
  });
};


export const createProduct = async (req, res) => {
  try {
    const result = await Service.createProduct(req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};



export const getAllProducts = async (req, res) => {
  try {
    const result = await Service.listProducts(req.query);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};




export const updateProduct = async (req, res) => {
  try {
    const result = await Service.updateProduct(req.params.id, req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};


export const updateProductStatus = async (req, res) => {
  try {
    const result = await Service.updateProductStatus(req.params.id, req.body.status);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}


export const deleteProduct = async (req, res) => {
  try {
    const result = await Service.deleteProduct(req.params.id);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};
