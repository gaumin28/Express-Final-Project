import { Router } from "express";
import {
  cancelMyOrder,
  createOrder,
  getAllOrders,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import {
  validateAdminRole,
  validateCustomerToken,
} from "../middlewares/customerMiddleware.js";

const orderRouter = Router();

orderRouter.post("/", validateCustomerToken, createOrder);
orderRouter.get("/mine", validateCustomerToken, getMyOrders);
orderRouter.patch("/:orderId/cancel", validateCustomerToken, cancelMyOrder);
orderRouter.get("/", validateCustomerToken, validateAdminRole, getAllOrders);
orderRouter.patch(
  "/:orderId/status",
  validateCustomerToken,
  validateAdminRole,
  updateOrderStatus,
);

export default orderRouter;
