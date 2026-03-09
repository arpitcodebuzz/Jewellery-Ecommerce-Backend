import * as service from './orders.service.js';

const sendResponse = (res, result) => {
  return res.status(result.statusCode).json({
    status: result.status,
    message: result.message,
    data: result.data ?? null
  });
};

export const checkOutOrder = async (req, res) => {
  try {
    const result = await service.checkOutOrderService(req.user.id, req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const result = await service.getMyOrdersService(req.user.id);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const result = await service.getOrderByIdService(req.params.orderId);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};  

export const cancelOrder = async (req, res) => {
  try {
    const result = await service.cancelOrderService(req.params.orderId);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};