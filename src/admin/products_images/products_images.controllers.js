
import * as Service from "./products_images.service.js";
import {deleteFileIfFail} from "../../common/utils/deleteImage.js";


const sendResponse = (res, result) => {
  return res.status(result.statusCode).json({
    status: result.status,
    message: result.message,
    data: result.data ?? null
  });
};

export const addProductImage = async (req, res) => {

  try {
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "Image is required"
      });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/products_images/${req.file.filename}`;

    const result = await Service.addProductImage(req.params.productId, imageUrl);

    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    deleteFileIfFail(req.file.filename);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};


export const getProductImages = async (req, res) => {
  try {
    const result = await Service.listProductImages(req.params.productId);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};

export const deleteProductImage = async (req, res) => {
  try {
    const result = await Service.deleteProductImage(req.params.productId, req.params.imageId);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};