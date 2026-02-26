
import * as Service from "./products_stones.service.js";


const sendResponse = (res, result) => {
  return res.status(result.statusCode).json({
    status: result.status,
    message: result.message,
    data: result.data ?? null
  });
};


export const addProductStone = async (req, res) => {
  try {
    const result = await Service.addProductStone(req.params.productId, req.body);
    return sendResponse(res, result);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};


export const getAllProductStones = async (req, res) => {
  try {
    const result = await Service.listProductStones(req.params.productId);
    return sendResponse(res, result);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};


export const updateProductStone = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const stoneId = Number(req.params.stoneId);

    if (!Number.isFinite(productId) || productId <= 0) {
      return res.status(400).json({ status: false, message: "Invalid productId" });
    }
    if (!Number.isFinite(stoneId) || stoneId <= 0) {
      return res.status(400).json({ status: false, message: "Invalid stoneId" });
    }

    const result = await Service.updateProductStone(productId, stoneId, req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.error("updateProductStone controller error:", error);
    return res.status(500).json({ status: false, message: "Something went wrong" });
  }
};


export const deleteProductStone = async (req, res) => {
  try {
    const result = await Service.deleteProductStone(req.params.productId, req.params.stoneId);
    return sendResponse(res, result);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};