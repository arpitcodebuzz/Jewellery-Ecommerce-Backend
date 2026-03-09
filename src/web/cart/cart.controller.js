import * as service from './cart.service.js';

const sendResponse = (res, result) => {
  return res.status(result.statusCode).json({
    status: result.status,
    message: result.message,
    data: result.data ?? null
  });
};


export const addItemToCart = async (req, res) => {
  try {
    const result = await service.addItemToCartService(req.user.id, req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};


export const getMyCart = async (req, res) => {
  try {
    const result = await service.getMyCartService(req.user.id);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};



export const updateCartItem = async (req, res) => {
  try {
    const result = await service.updateCartItemService(req.params.itemId, req.user.id, req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};


export const deleteCartItem = async (req, res) => {
  try {
    const result = await service.deleteCartItemService(req.params.itemId, req.user.id);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};


export const clearCart = async (req, res) => {
  try {
    const result = await service.clearCartService(req.user.id);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};
