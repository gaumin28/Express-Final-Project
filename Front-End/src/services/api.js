// ---------------------------------------------------------------------------
// src/services/api.js
// All data-fetching lives here. Every function is async so that swapping out
// the mock implementations for real fetch() calls later requires only editing
// this one file — your pages/components don't need to change.
// ---------------------------------------------------------------------------

import { products as mockProducts } from "../data/products";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const TOKEN_KEY = "shopbee_token";

function normalizeProduct(product) {
  if (!product) return product;
  return {
    ...product,
    id: product.id || product._id,
  };
}

function normalizeUser(user) {
  if (!user) return user;
  return {
    ...user,
    id: user.id || user._id,
    role: String(user.role || "user").toLowerCase(),
  };
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function fetchJSON(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    throw new Error(
      payload?.error || payload?.message || `Request failed (${res.status})`,
    );
  }

  return payload;
}

/** Simulate network latency in development */
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────

export async function getProducts() {
  try {
    const payload = await fetchJSON("/api/products");
    const items = Array.isArray(payload) ? payload : payload?.products || [];
    return items.map(normalizeProduct);
  } catch {
    await delay();
    return [...mockProducts];
  }
}

export async function getProductById(id) {
  try {
    const payload = await fetchJSON(`/api/products/${id}`);
    const product = payload?.data || payload;
    return normalizeProduct(product);
  } catch (error) {
    if (/404/.test(error.message) || /not found/i.test(error.message)) {
      return null;
    }

    await delay(400);
    return mockProducts.find((p) => p.id === Number(id)) ?? null;
  }
}

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export async function loginUser({ email, password }) {
  try {
    const payload = await fetchJSON("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setToken(payload.token);
    const user = normalizeUser(payload.data || payload.user);
    localStorage.setItem("shopbee_user", JSON.stringify(user));
    return user;
  } catch {
    await delay(800);
    if (!email || !password)
      throw new Error("Email and password are required.");

    const existing = JSON.parse(localStorage.getItem("shopbee_user") || "null");
    if (existing && existing.email === email) return existing;

    const user = {
      id: 1,
      email,
      firstName: "John",
      lastName: "Doe",
      avatar: email[0].toUpperCase(),
      memberSince: new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      role: email.toLowerCase().includes("admin") ? "admin" : "user",
    };
    localStorage.setItem("shopbee_user", JSON.stringify(user));
    return user;
  }
}

export async function registerUser({ firstName, lastName, email, password }) {
  try {
    const name = `${firstName || ""} ${lastName || ""}`.trim();
    const generatedPhone = `9${Date.now().toString().slice(-9)}`;
    const payload = await fetchJSON("/api/auth/register", {
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
  } catch {
    await delay(900);
    if (!email || !password)
      throw new Error("Please fill in all required fields.");

    const user = {
      id: Date.now(),
      email,
      firstName,
      lastName,
      avatar: firstName ? firstName[0].toUpperCase() : email[0].toUpperCase(),
      memberSince: new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      role: "user",
    };
    localStorage.setItem("shopbee_user", JSON.stringify(user));
    return user;
  }
}

export async function logoutUser() {
  setToken(null);
  localStorage.removeItem("shopbee_user");
  await delay(100);
}

export async function getCurrentUser() {
  try {
    const payload = await fetchJSON("/api/auth/me");
    const user = normalizeUser(payload.data || payload.user);
    localStorage.setItem("shopbee_user", JSON.stringify(user));
    return user;
  } catch {
    return JSON.parse(localStorage.getItem("shopbee_user") || "null");
  }
}

// ─────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────

const mockOrders = [
  {
    id: "#ORD-8821",
    date: "Mar 18, 2026",
    total: 318,
    status: "Delivered",
    items: 3,
  },
  {
    id: "#ORD-8819",
    date: "Mar 10, 2026",
    total: 79,
    status: "Shipped",
    items: 1,
  },
  {
    id: "#ORD-8812",
    date: "Feb 28, 2026",
    total: 224,
    status: "Delivered",
    items: 2,
  },
  {
    id: "#ORD-8801",
    date: "Feb 14, 2026",
    total: 35,
    status: "Delivered",
    items: 1,
  },
];

export async function getOrders() {
  try {
    return await fetchJSON("/api/orders/mine");
  } catch {
    await delay(700);
    return mockOrders;
  }
}

export async function placeOrder(orderData) {
  try {
    return await fetchJSON("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  } catch {
    await delay(1000);
    return { success: true, orderId: `ORD-${Date.now()}` };
  }
}

export async function getAdminOrders() {
  return fetchJSON("/api/orders");
}

export async function updateOrderStatus(orderId, status) {
  return fetchJSON(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
