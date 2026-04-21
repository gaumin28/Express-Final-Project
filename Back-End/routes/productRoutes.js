import express from "express";
import {
  addProduct,
  deleteProducts,
  generateProducts,
  getProductById,
  getProducts,
  updateProducts,
} from "../controllers/productController.js";
import { validateGenerateProductsPayload } from "../middlewares/productMiddleware.js";
import {
  validateAdminRole,
  validateCustomerToken,
} from "../middlewares/customerMiddleware.js";

const productRouter = express.Router();

productRouter.post(
  "/generate",
  validateCustomerToken,
  validateAdminRole,
  validateGenerateProductsPayload,
  generateProducts,
);
productRouter.post("/", validateCustomerToken, validateAdminRole, addProduct);

productRouter.get("", getProducts);
productRouter.get("/:productId", getProductById);
productRouter.put(
  "/:productId",
  validateCustomerToken,
  validateAdminRole,
  updateProducts,
);
productRouter.delete(
  "/:productId",
  validateCustomerToken,
  validateAdminRole,
  deleteProducts,
);
export default productRouter;
