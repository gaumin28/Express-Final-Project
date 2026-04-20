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

export default CustomerRoute;
