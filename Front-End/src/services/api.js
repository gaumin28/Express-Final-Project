// ---------------------------------------------------------------------------
// src/services/api.js
// All data-fetching lives here. Every function is async so that swapping out
// the mock implementations for real fetch() calls later requires only editing
// this one file — your pages/components don't need to change.
// ---------------------------------------------------------------------------

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const TOKEN_KEY = "shopbee_token";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

function inferCategoryFromProduct(product) {
  const text =
    `${product?.category || ""} ${product?.name || ""} ${product?.slug || ""}`.toLowerCase();

  if (/sneaker|jacket|fashion/.test(text)) return "Fashion";
  if (/backpack|accessories|bag/.test(text)) return "Accessories";
  if (/gaming|mouse|keyboard/.test(text)) return "Gaming";
  if (/coffee|lamp|home|water\s*bottle/.test(text)) return "Home";
  if (/headphone|watch|speaker|electronic|bluetooth/.test(text)) {
    return "Electronics";
  }
  if (
    /sport|fitness|gym|running|yoga|workout|dumbbell|jersey|athletic/.test(text)
  ) {
    return "Sports";
  }

  return "General";
}

function normalizeProduct(product) {
  if (!product) return product;

  const category = product.category
    ? String(product.category)
    : inferCategoryFromProduct(product);

  return {
    ...product,
    id: product.id || product._id,
    category,
  };
}

function normalizeUser(user) {
  if (!user) return user;

  const fullName = String(user.name || "").trim();
  const nameParts = fullName ? fullName.split(/\s+/) : [];
  const firstName = user.firstName || nameParts[0] || "";
  const lastName =
    user.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");

  const memberSince = user.memberSince
    ? user.memberSince
    : user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : undefined;

  return {
    ...user,
    id: user.id || user._id,
    firstName,
    lastName,
    name: fullName || `${firstName} ${lastName}`.trim(),
    role: String(user.role || "user").toLowerCase(),
    memberSince,
  };
}

function normalizeOrderProduct(item) {
  if (!item) return item;

  const linkedProduct = item.linkedProduct
    ? {
        ...item.linkedProduct,
        id: item.linkedProduct.id || item.linkedProduct._id,
        price: Number(item.linkedProduct.price || 0),
        stock: Number(item.linkedProduct.stock || 0),
        rating: Number(item.linkedProduct.rating || 0),
        numReviews: Number(item.linkedProduct.numReviews || 0),
      }
    : null;

  return {
    ...item,
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 0),
    linkedProduct,
  };
}

function normalizeOrder(order) {
  if (!order) return order;

  const normalizedProducts = Array.isArray(order.products)
    ? order.products.map(normalizeOrderProduct)
    : [];

  const itemCount = Array.isArray(order.items)
    ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    : Number(order.itemsCount ?? order.items ?? normalizedProducts.length);

  return {
    ...order,
    id:
      order.id ||
      (order.orderId ? `#${order.orderId}` : order._id ? `#${order._id}` : ""),
    customer: order.customer || order.shipping?.fullName || "Customer",
    email: order.email || order.shipping?.email || "",
    date:
      order.date ||
      (order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : ""),
    products: normalizedProducts,
    items: itemCount,
    total: Number(order.total || 0),
  };
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});

async function requestJSON(path, options = {}) {
  try {
    const response = await apiClient({
      url: path,
      method: options.method || "GET",
      data: options.body ? JSON.parse(options.body) : undefined,
      headers: options.headers,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const payload = error.response?.data;

      throw new Error(
        payload?.error ||
          payload?.message ||
          `Request failed (${status || "network error"})`,
      );
    }

    throw error;
  }
}

/** Simulate network latency in development */
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────

export async function getProducts() {
  const { products } = await getProductsPage({ page: 1, limit: 50 });
  return products;
}

export async function getProductsPage({
  page = 1,
  limit = 50,
  search,
  sortBy,
  sort,
  isFeatured,
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", String(search));
  if (sortBy) params.set("sortBy", String(sortBy));
  if (sort) params.set("sort", String(sort));
  if (typeof isFeatured === "boolean") {
    params.set("isFeatured", String(isFeatured));
  }

  const payload = await requestJSON(`/api/products?${params.toString()}`);
  const items = Array.isArray(payload) ? payload : payload?.products || [];

  return {
    products: items.map(normalizeProduct),
    totalProducts: Number(payload?.totalProducts || items.length || 0),
    page: Number(payload?.page || page),
    limit: Number(payload?.limit || limit),
  };
}

export async function getProductById(id) {
  try {
    const payload = await requestJSON(`/api/products/${id}`);
    const product = payload?.data || payload;
    return normalizeProduct(product);
  } catch (error) {
    if (/404/.test(error.message) || /not found/i.test(error.message)) {
      return null;
    }

    throw error;
  }
}

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export async function loginUser({ email, password }) {
  const payload = await requestJSON("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setToken(payload.token);
  const user = normalizeUser(payload.data || payload.user);
  localStorage.setItem("shopbee_user", JSON.stringify(user));
  return user;
}

export async function registerUser({ firstName, lastName, email, password }) {
  const name = `${firstName || ""} ${lastName || ""}`.trim();
  const generatedPhone = `9${Date.now().toString().slice(-9)}`;
  const payload = await requestJSON("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: name || email?.split("@")[0] || "User",
      email,
      password,
      phone: generatedPhone,
    }),
  });

  if (payload.token) {
    setToken(payload.token);
  }

  const user = normalizeUser(payload.data || payload.user);
  localStorage.setItem("shopbee_user", JSON.stringify(user));
  return user;
}

export async function logoutUser() {
  setToken(null);
  localStorage.removeItem("shopbee_user");
  await delay(100);
}

export async function getCurrentUser() {
  try {
    const payload = await requestJSON("/api/auth/me");
    const user = normalizeUser(payload.data || payload.user);
    localStorage.setItem("shopbee_user", JSON.stringify(user));
    return user;
  } catch {
    setToken(null);
    localStorage.removeItem("shopbee_user");
    return null;
  }
}

export async function updateCurrentUser({
  firstName,
  lastName,
  email,
  password,
}) {
  const name = `${firstName || ""} ${lastName || ""}`.trim();
  const payload = await requestJSON("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify({
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(password ? { password } : {}),
    }),
  });

  const user = normalizeUser(payload.data || payload.user);
  localStorage.setItem("shopbee_user", JSON.stringify(user));
  return user;
}

// ─────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────

export async function getOrders() {
  const payload = await requestJSON("/api/orders/mine");
  const items = Array.isArray(payload) ? payload : payload?.orders || [];
  return items.map(normalizeOrder);
}

export async function placeOrder(orderData) {
  const payload = await requestJSON("/api/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
  return {
    ...payload,
    order: normalizeOrder(payload?.order),
  };
}

export async function getAdminOrders() {
  const payload = await requestJSON("/api/orders");
  const items = Array.isArray(payload) ? payload : payload?.orders || [];
  return items.map(normalizeOrder);
}

export async function updateOrderStatus(orderId, status) {
  const payload = await requestJSON(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return {
    ...payload,
    order: normalizeOrder(payload?.order),
  };
}

export async function cancelMyOrder(orderId) {
  const payload = await requestJSON(`/api/orders/${orderId}/cancel`, {
    method: "PATCH",
  });

  return {
    ...payload,
    order: normalizeOrder(payload?.order),
  };
}
