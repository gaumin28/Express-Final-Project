import CustomerModel from "../models/customerModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

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
    const safeCustomer = newCustomer.toObject();
    delete safeCustomer.password;
    return res.status(201).json({
      message: "success",
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

    const token = jwt.sign(
      {
        id: existedCustomer._id,
        email: existedCustomer.email,
        role: existedCustomer.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

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

export default createCustomer;
export { loginCustomer, getCurrentCustomer };
