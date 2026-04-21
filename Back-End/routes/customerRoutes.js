import { Router } from "express";
import validateExistedCustomer, {
  validateLoginPayload,
  validateRegisterPayload,
  validateCustomerToken,
} from "../middlewares/customerMiddleware.js";
import createCustomer, {
  getCurrentCustomer,
  loginCustomer,
  updateCurrentCustomer,
  getAllCustomers,
  updateCustomerById,
  deleteCustomerById,
} from "../controllers/customerController.js";

const CustomerRoute = Router();

CustomerRoute.post(
  "/register",
  validateRegisterPayload,
  validateExistedCustomer,
  createCustomer,
);
CustomerRoute.post("/login", validateLoginPayload, loginCustomer);
CustomerRoute.get("/me", validateCustomerToken, getCurrentCustomer);
CustomerRoute.patch("/me", validateCustomerToken, updateCurrentCustomer);
CustomerRoute.get("/validate-token", validateCustomerToken, (req, res) => {
  return res.status(200).json({
    message: "Token is valid",
    data: req.customer,
  });
});

// Admin routes for managing customers
CustomerRoute.get("/customers", validateCustomerToken, getAllCustomers);
CustomerRoute.patch(
  "/customers/:id",
  validateCustomerToken,
  updateCustomerById,
);
CustomerRoute.delete(
  "/customers/:id",
  validateCustomerToken,
  deleteCustomerById,
);

export default CustomerRoute;
