import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getOrders } from "../services/api";

const statusStyles = {
  Delivered: "bg-emerald-100 text-emerald-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-700",
};

const TABS = ["Overview", "Orders", "Settings"];

function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    refreshUser().catch(() => {});
    getOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [refreshUser]);

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders],
  );

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="flex flex-col items-start gap-5 rounded-3xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600">
          {user?.avatar || user?.firstName?.[0] || "U"}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">
            {user
              ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
              : "Guest"}
          </h1>
          <p className="text-sm text-slate-500">{user?.email || "-"}</p>
          <p className="mt-1 text-xs text-slate-400">
            Member since {user?.memberSince || "-"}
          </p>
        </div>
        <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          Edit profile
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${activeTab === tab ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                id: "orders",
                label: "Total orders",
                value: String(orders.length),
              },
              {
                id: "spent",
                label: "Total spent",
                value: `$${totalSpent.toFixed(2)}`,
              },
              { id: "wishlist", label: "Wishlist items", value: "2" },
            ].map((stat) => (
              <div
                key={stat.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-center"
              >
                <p className="text-2xl font-extrabold text-indigo-600">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Recent orders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Recent orders
              </h2>
              <button
                onClick={() => setActiveTab("Orders")}
                className="text-sm text-indigo-600 hover:underline"
              >
                View all
              </button>
            </div>
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {order.id}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.date} · {order.items} item
                    {order.items !== 1 ? "s" : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                >
                  {order.status}
                </span>
                <p className="text-sm font-bold text-slate-900">
                  ${order.total}
                </p>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
                No orders yet.
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "Orders" && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Order history</h2>
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {order.id}
                </p>
                <p className="text-xs text-slate-500">
                  {order.date} · {order.items} item
                  {order.items !== 1 ? "s" : ""}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
              >
                {order.status}
              </span>
              <p className="text-sm font-bold text-slate-900">${order.total}</p>
              <button className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                View
              </button>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
              No orders found.
            </p>
          )}
        </div>
      )}

      {activeTab === "Settings" && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Account settings</h2>
          <form
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "First name", value: "John" },
                { label: "Last name", value: "Doe" },
              ].map((field) => (
                <div key={field.label} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <input
                    defaultValue={field.value}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                defaultValue="john.doe@example.com"
                type="email"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                New password
              </label>
              <input
                placeholder="Leave blank to keep current"
                type="password"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              Save changes
            </button>
          </form>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <h3 className="text-sm font-bold text-red-700">Danger zone</h3>
            <p className="mt-1 text-xs text-red-500">
              Once you delete your account, there is no going back.
            </p>
            <button className="mt-3 rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition">
              Delete account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
