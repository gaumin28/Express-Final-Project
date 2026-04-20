import mongoose from "mongoose";
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      required: true,
    },
    role: {
      type: String,
      default: "CUSTOMER",
    },
  },
  { timestamps: true },
);

const CustomerModel = mongoose.model("customers", customerSchema);
export default CustomerModel;
