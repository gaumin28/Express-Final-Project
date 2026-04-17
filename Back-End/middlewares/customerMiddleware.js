import CustomerModel from "../models/customerModel.js";
import jwt from "jsonwebtoken";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

const isValidPassword = (value) => {
  if (typeof value !== "string") return false;
  if (value.length < 8 || value.length > 72) return false;
  return /[A-Za-z]/.test(value) && /[0-9]/.test(value);
};

export const validateRegisterPayload = (req, res, next) => {
  const { email, name, phone, password } = req.body;

  if (!email || !name || !phone || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 100
  ) {
    return res.status(400).json({
      error: "Invalid name. Name length must be between 2 and 100 characters",
    });
  }

  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (typeof phone !== "string" || !PHONE_REGEX.test(phone.trim())) {
    return res.status(400).json({
      error: "Invalid phone format. Use 8-15 digits, optional leading +",
    });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      error:
        "Invalid password. Use 8-72 chars with at least 1 letter and 1 number",
    });
  }

  next();
};

export const validateLoginPayload = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 72
  ) {
    return res.status(400).json({ error: "Invalid password format" });
  }

  next();
};

const validateExistedCustomer = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    const emailCustomerExisted = await CustomerModel.findOne({ email });
    const phoneCustomerExisted = await CustomerModel.findOne({ phone });
    if (emailCustomerExisted || phoneCustomerExisted) {
      return res.status(409).json({ error: "Customer existed" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const validateCustomerToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentCustomer = await CustomerModel.findById(decoded.id).select(
      "-password",
    );
    if (!currentCustomer) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.customer = currentCustomer;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const validateAdminRole = (req, res, next) => {
  const role = req.customer?.role;
  if (role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden: admin role required" });
  }

  next();
};

export default validateExistedCustomer;
