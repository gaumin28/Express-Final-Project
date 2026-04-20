import CustomerModel from "../models/customerModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createCustomerToken = (customer) =>
  jwt.sign(
    {
      id: customer._id,
      email: customer.email,
      role: customer.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

const createCustomer = async (req, res, next) => {
  try {
    const { email, name, phone, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newCustomer = await CustomerModel.create({
      email,
      name,
      phone,
      password: hashedPassword,
    });
    const token = createCustomerToken(newCustomer);
    const safeCustomer = newCustomer.toObject();
    delete safeCustomer.password;
    return res.status(201).json({
      message: "success",
      token,
      data: safeCustomer,
    });
  } catch (error) {
    return next(error);
  }
};

const loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw createHttpError(400, "Missing email or password");
    }

    const existedCustomer = await CustomerModel.findOne({ email });
    if (!existedCustomer) {
      throw createHttpError(401, "Email or password incorrect");
    }

    const validPassword = bcrypt.compareSync(
      password,
      existedCustomer.password,
    );
    if (!validPassword) {
      throw createHttpError(401, "Email or password incorrect");
    }

    const token = createCustomerToken(existedCustomer);

    const safeCustomer = existedCustomer.toObject();
    delete safeCustomer.password;

    return res.status(200).json({
      message: "Success",
      token,
      data: safeCustomer,
    });
  } catch (error) {
    return next(error);
  }
};

const getCurrentCustomer = async (req, res) => {
  return res.status(200).json({
    message: "Success",
    data: req.customer,
  });
};

const updateCurrentCustomer = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 100
      ) {
        throw createHttpError(
          400,
          "Invalid name. Name length must be between 2 and 100 characters",
        );
      }

      updates.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

      if (!emailRegex.test(normalizedEmail)) {
        throw createHttpError(400, "Invalid email format");
      }

      const existedCustomer = await CustomerModel.findOne({
        email: normalizedEmail,
        _id: { $ne: req.customer._id },
      });

      if (existedCustomer) {
        throw createHttpError(409, "Email already in use");
      }

      updates.email = normalizedEmail;
    }

    if (password !== undefined && password !== "") {
      const isValidPassword =
        typeof password === "string" &&
        password.length >= 8 &&
        password.length <= 72 &&
        /[A-Za-z]/.test(password) &&
        /[0-9]/.test(password);

      if (!isValidPassword) {
        throw createHttpError(
          400,
          "Invalid password. Use 8-72 chars with at least 1 letter and 1 number",
        );
      }

      updates.password = bcrypt.hashSync(password, 10);
    }

    if (Object.keys(updates).length === 0) {
      throw createHttpError(400, "No changes provided");
    }

    const updatedCustomer = await CustomerModel.findByIdAndUpdate(
      req.customer._id,
      updates,
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    return next(error);
  }
};

export default createCustomer;
export { loginCustomer, getCurrentCustomer, updateCurrentCustomer };
