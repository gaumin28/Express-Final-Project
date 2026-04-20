import mongoose from "mongoose";
import OrderModel from "../models/orderModel.js";
import ProductModel from "../models/productModel.js";

const VALID_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const toRoundedNumber = (value) => Number(Number(value).toFixed(2));

const buildOrderNumber = () =>
  `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const ORDER_POPULATE_OPTIONS = [
  {
    path: "customer",
    select: "name email",
  },
  {
    path: "items.product",
    select:
      "name slug price image stock rating numReviews isFeatured isDeleted",
  },
];

const formatLinkedProduct = (product) => {
  if (!product || typeof product !== "object") {
    return null;
  }

  return {
    id: String(product._id),
    name: product.name,
    slug: product.slug,
    price: toRoundedNumber(product.price),
    image: product.image,
    stock: product.stock,
    rating: product.rating,
    numReviews: product.numReviews,
    isFeatured: product.isFeatured,
    isDeleted: product.isDeleted,
  };
};

const formatOrderItem = (item) => ({
  productId: item.productId,
  name: item.name,
  image: item.image,
  price: toRoundedNumber(item.price),
  quantity: Number(item.quantity),
  product: item.product,
  linkedProduct: formatLinkedProduct(item.product),
});

const formatOrder = (order) => {
  const customerName =
    order.shipping?.firstName || order.shipping?.lastName
      ? `${order.shipping?.firstName || ""} ${order.shipping?.lastName || ""}`.trim()
      : order.customer?.name || "Customer";

  const customerEmail = order.shipping?.email || order.customer?.email || "";
  const formattedItems = Array.isArray(order.items)
    ? order.items.map(formatOrderItem)
    : [];
  const itemCount = formattedItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  return {
    id: `#${order.orderNumber}`,
    orderId: order.orderNumber,
    customer: customerName,
    email: customerEmail,
    date: formatDate(order.createdAt),
    items: itemCount,
    total: toRoundedNumber(order.total),
    status: order.status,
    shipping: order.shipping,
    paymentMethod: order.paymentMethod,
    subtotal: toRoundedNumber(order.subtotal),
    shippingFee: toRoundedNumber(order.shippingFee),
    tax: toRoundedNumber(order.tax),
    products: formattedItems,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

const validateOrderItem = (item) => {
  if (!item || typeof item !== "object") {
    return "Each order item must be an object";
  }

  if (
    item.productId === undefined ||
    item.productId === null ||
    `${item.productId}`.trim() === ""
  ) {
    return "Each order item must include a productId";
  }

  if (!item.name || typeof item.name !== "string") {
    return "Each order item must include a product name";
  }

  if (!Number.isFinite(Number(item.price)) || Number(item.price) < 0) {
    return "Each order item must include a valid price";
  }

  if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
    return "Each order item must include a quantity >= 1";
  }

  return null;
};

const validateShipping = (shipping) => {
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "zip",
    "method",
  ];

  for (const field of requiredFields) {
    if (!shipping?.[field] || typeof shipping[field] !== "string") {
      return `Missing or invalid shipping field: ${field}`;
    }
  }

  return null;
};

export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shipping,
      paymentMethod,
      subtotal,
      shippingFee,
      tax,
      total,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw createHttpError(400, "Order must contain at least one item");
    }

    for (const item of items) {
      const itemError = validateOrderItem(item);
      if (itemError) throw createHttpError(400, itemError);
    }

    const shippingError = validateShipping(shipping);
    if (shippingError) throw createHttpError(400, shippingError);

    if (!paymentMethod || typeof paymentMethod !== "string") {
      throw createHttpError(400, "Missing or invalid paymentMethod");
    }

    const numericSubtotal = Number(subtotal);
    const numericShippingFee = Number(shippingFee);
    const numericTax = Number(tax);
    const numericTotal = Number(total);

    const amountValues = [
      numericSubtotal,
      numericShippingFee,
      numericTax,
      numericTotal,
    ];
    if (amountValues.some((value) => !Number.isFinite(value) || value < 0)) {
      throw createHttpError(400, "Invalid order totals");
    }

    const computedSubtotal = toRoundedNumber(
      items.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0,
      ),
    );

    if (Math.abs(computedSubtotal - toRoundedNumber(numericSubtotal)) > 0.01) {
      throw createHttpError(400, "Subtotal does not match items total");
    }

    const computedTotal = toRoundedNumber(
      numericSubtotal + numericShippingFee + numericTax,
    );

    if (Math.abs(computedTotal - toRoundedNumber(numericTotal)) > 0.01) {
      throw createHttpError(
        400,
        "Total does not match subtotal, shipping, and tax",
      );
    }

    const requestedQuantityByProductId = new Map();
    for (const item of items) {
      const productId = String(item.productId).trim();

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw createHttpError(400, `Invalid product id: ${productId}`);
      }

      requestedQuantityByProductId.set(
        productId,
        (requestedQuantityByProductId.get(productId) || 0) +
          Number(item.quantity),
      );
    }

    const productIds = Array.from(requestedQuantityByProductId.keys());

    const products = await ProductModel.find({ _id: { $in: productIds } })
      .select("_id name stock isDeleted")
      .lean();

    if (products.length !== productIds.length) {
      throw createHttpError(400, "One or more products do not exist");
    }

    const productById = new Map(
      products.map((product) => [String(product._id), product]),
    );

    for (const [
      productId,
      requestedQuantity,
    ] of requestedQuantityByProductId.entries()) {
      const product = productById.get(productId);

      if (!product || product.isDeleted) {
        throw createHttpError(400, "One or more products are unavailable");
      }

      if (Number(product.stock) < requestedQuantity) {
        throw createHttpError(
          400,
          `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        );
      }
    }

    const stockUpdateOperations = Array.from(
      requestedQuantityByProductId.entries(),
    ).map(([productId, requestedQuantity]) => ({
      updateOne: {
        filter: {
          _id: productId,
          isDeleted: false,
          stock: { $gte: requestedQuantity },
        },
        update: { $inc: { stock: -requestedQuantity } },
      },
    }));

    const stockUpdateResult = await ProductModel.bulkWrite(
      stockUpdateOperations,
      {
        ordered: true,
      },
    );

    if (stockUpdateResult.modifiedCount !== stockUpdateOperations.length) {
      throw createHttpError(409, "Some products are out of stock");
    }

    const normalizedItems = items.map((item) => {
      const productId = String(item.productId).trim();
      return {
        productId,
        product: productId,
        name: item.name.trim(),
        image: typeof item.image === "string" ? item.image.trim() : "",
        price: toRoundedNumber(item.price),
        quantity: Number(item.quantity),
      };
    });

    const order = await OrderModel.create({
      orderNumber: buildOrderNumber(),
      customer: req.customer._id,
      items: normalizedItems,
      shipping: {
        firstName: shipping.firstName.trim(),
        lastName: shipping.lastName.trim(),
        email: shipping.email.trim(),
        phone: shipping.phone.trim(),
        address: shipping.address.trim(),
        city: shipping.city.trim(),
        state: shipping.state.trim(),
        zip: shipping.zip.trim(),
        method: shipping.method.trim(),
      },
      paymentMethod: paymentMethod.trim(),
      subtotal: toRoundedNumber(numericSubtotal),
      shippingFee: toRoundedNumber(numericShippingFee),
      tax: toRoundedNumber(numericTax),
      total: toRoundedNumber(numericTotal),
    });

    const populatedOrder = await OrderModel.findById(order._id).populate(
      ORDER_POPULATE_OPTIONS,
    );

    return res.status(201).json({
      message: "Order placed successfully",
      order: formatOrder(populatedOrder),
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find({ customer: req.customer._id })
      .sort({ createdAt: -1 })
      .populate(ORDER_POPULATE_OPTIONS);

    return res.status(200).json(orders.map(formatOrder));
  } catch (error) {
    return next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find({})
      .sort({ createdAt: -1 })
      .populate(ORDER_POPULATE_OPTIONS);

    return res.status(200).json(orders.map(formatOrder));
  } catch (error) {
    return next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || typeof orderId !== "string") {
      throw createHttpError(400, "Missing order id");
    }

    if (!VALID_STATUSES.includes(status)) {
      throw createHttpError(400, "Invalid order status");
    }

    const normalizedOrderId = orderId.replace(/^#/, "").trim();
    const order = await OrderModel.findOne({
      orderNumber: normalizedOrderId,
    }).populate(ORDER_POPULATE_OPTIONS);

    if (!order) {
      throw createHttpError(404, "Order not found");
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order: formatOrder(order),
    });
  } catch (error) {
    return next(error);
  }
};

export const cancelMyOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    if (!orderId || typeof orderId !== "string") {
      throw createHttpError(400, "Missing order id");
    }

    const normalizedOrderId = orderId.replace(/^#/, "").trim();

    const order = await OrderModel.findOne({
      orderNumber: normalizedOrderId,
      customer: req.customer._id,
    });

    if (!order) {
      throw createHttpError(404, "Order not found");
    }

    if (order.status === "Cancelled") {
      throw createHttpError(400, "Order is already cancelled");
    }

    if (order.status !== "Processing") {
      throw createHttpError(400, "Only processing orders can be cancelled");
    }

    const stockRestoreMap = new Map();
    for (const item of order.items || []) {
      const productId = String(item.product || item.productId || "").trim();
      if (!mongoose.Types.ObjectId.isValid(productId)) continue;

      stockRestoreMap.set(
        productId,
        (stockRestoreMap.get(productId) || 0) + Number(item.quantity || 0),
      );
    }

    const stockRestoreOps = Array.from(stockRestoreMap.entries()).map(
      ([productId, quantity]) => ({
        updateOne: {
          filter: { _id: productId },
          update: { $inc: { stock: quantity } },
        },
      }),
    );

    if (stockRestoreOps.length > 0) {
      await ProductModel.bulkWrite(stockRestoreOps, {
        ordered: false,
      });
    }

    order.status = "Cancelled";
    await order.save();

    const populatedOrder = await OrderModel.findById(order._id).populate(
      ORDER_POPULATE_OPTIONS,
    );

    return res.status(200).json({
      message: "Order cancelled successfully",
      order: formatOrder(populatedOrder),
    });
  } catch (error) {
    return next(error);
  }
};
