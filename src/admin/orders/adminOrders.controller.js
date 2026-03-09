import * as service from "./adminOrders.service.js";

const sendResponse = (res, result) => {
  return res.status(result.statusCode).json({
    status: result.status,
    message: result.message,
    data: result.data ?? null,
  });
};

export const getOrders = async (req, res) => {
  try {
    const result = await service.getAllOrdersService(req.query);
    return sendResponse(res, result);
  } catch (error) {
    console.error("Error in getOrders controller:", error.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const result = await service.getOrderByIdService(req.params.orderId);
    return sendResponse(res, result);
  } catch (error) {
    console.error("Error in getOrderDetails controller:", error.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const result = await service.updateOrderStatusService(
      req.params.id,
      req.body.status
    );
    return sendResponse(res, result);
  } catch (error) {
    console.error("Error in updateStatus controller:", error.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};
