import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";
import { useToast } from "../context/ToastContext";
import { cancelMyOrder, getOrders, updateCurrentUser } from "../services/api";

const statusStyles = {
  Delivered: "bg-emerald-100 text-emerald-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-700",
};

const TABS = ["Overview", "Orders", "Settings"];

function OrderProductPreview({ order }) {
  const previewItems = Array.isArray(order.products)
    ? order.products.slice(0, 2)
    : [];

  if (previewItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
      {previewItems.map((item, index) => {
        const linkedProduct = item.linkedProduct;
        const label = `${item.name} × ${item.quantity}`;

        if (linkedProduct?.id) {
          return (
            <Link
              key={`${order.id}-${linkedProduct.id}-${index}`}
              to={`/product/${linkedProduct.id}`}
              className="rounded-full bg-slate-100 px-2.5 py-1 hover:bg-slate-200 hover:text-slate-700"
            >
              {label}
            </Link>
          );
        }

        return (
          <span
            key={`${order.id}-${item.productId}-${index}`}
            className="rounded-full bg-slate-100 px-2.5 py-1"
          >
            {label}
          </span>
        );
      })}
      {order.products.length > previewItems.length && (
        <span className="text-slate-400">
          +{order.products.length - previewItems.length} more
        </span>
      )}
    </div>
  );
}

function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { wishlistItems } = useCart();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("Overview");
  const [orders, setOrders] = useState([]);
  const [openedOrderId, setOpenedOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

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

  useEffect(() => {
    setFormValues({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      password: "",
    });
  }, [user]);

  async function handleSaveProfile(event) {
    event.preventDefault();

    setSaving(true);
    try {
      await updateCurrentUser({
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        password: formValues.password,
      });
      await refreshUser();
      setFormValues((prev) => ({ ...prev, password: "" }));
      toast({ message: "Profile updated successfully.", type: "success" });
    } catch (error) {
      toast({
        message: error.message || "Failed to update profile.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelOrder(order) {
    try {
      if (order.status !== "Processing") {
        toast({
          message: "Only processing orders can be cancelled.",
          type: "warning",
        });
        return;
      }

      setCancellingOrderId(order.id);
      const normalizedOrderId = String(order.id || "").replace(/^#/, "");
      const result = await cancelMyOrder(normalizedOrderId);

      setOrders((prev) =>
        prev.map((item) => (item.id === order.id ? result.order : item)),
      );

      toast({ message: "Order cancelled successfully.", type: "success" });
    } catch (error) {
      toast({
        message: error.message || "Failed to cancel order.",
        type: "error",
      });
    } finally {
      setCancellingOrderId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="flex flex-col items-start gap-5 rounded-3xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600">
          {user?.avatar || user?.firstName?.[0].toUpperCase() || "U"}
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
        {/* <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          Edit profile
        </button> */}
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
              {
                id: "wishlist",
                label: "Wishlist items",
                value: String(wishlistItems.length),
              },
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
                  <OrderProductPreview order={order} />
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
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4"
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {order.id}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.date} · {order.items} item
                    {order.items !== 1 ? "s" : ""}
                  </p>
                  <OrderProductPreview order={order} />
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                >
                  {order.status}
                </span>
                <p className="text-sm font-bold text-slate-900">
                  ${order.total}
                </p>
                <button
                  onClick={() =>
                    setOpenedOrderId((prev) =>
                      prev === order.id ? null : order.id,
                    )
                  }
                  className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  {openedOrderId === order.id ? "Hide" : "View"}
                </button>
              </div>

              {openedOrderId === order.id && (
                <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Shipping
                      </p>
                      <p className="mt-1 text-slate-700">
                        {order.shipping?.firstName} {order.shipping?.lastName}
                      </p>
                      <p className="text-slate-600">
                        {order.shipping?.address}
                      </p>
                      <p className="text-slate-600">
                        {order.shipping?.city}, {order.shipping?.state}{" "}
                        {order.shipping?.zip}
                      </p>
                      <p className="text-slate-600">{order.shipping?.email}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Payment Summary
                      </p>
                      <p className="mt-1">
                        Method: {order.paymentMethod || "-"}
                      </p>
                      <p>Subtotal: ${Number(order.subtotal || 0).toFixed(2)}</p>
                      <p>
                        Shipping: ${Number(order.shippingFee || 0).toFixed(2)}
                      </p>
                      <p>Tax: ${Number(order.tax || 0).toFixed(2)}</p>
                      <p className="font-semibold text-slate-900">
                        Total: ${Number(order.total || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Items
                    </p>
                    {(order.products || []).map((item, index) => (
                      <div
                        key={`${order.id}-${item.productId}-${index}`}
                        className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium text-slate-800">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900">
                          $
                          {(
                            Number(item.price || 0) * Number(item.quantity || 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    {order.status === "Processing" ? (
                      <button
                        onClick={() => handleCancelOrder(order)}
                        disabled={cancellingOrderId === order.id}
                        className="rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cancellingOrderId === order.id
                          ? "Cancelling..."
                          : "Cancel order"}
                      </button>
                    ) : (
                      <p className="text-xs text-slate-400">
                        This order is cancelled.
                      </p>
                    )}
                  </div>
                </div>
              )}
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
            onSubmit={handleSaveProfile}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "First name", key: "firstName" },
                { label: "Last name", key: "lastName" },
              ].map((field) => (
                <div key={field.label} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <input
                    value={formValues[field.key]}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
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
                value={formValues.email}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
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
                value={formValues.password}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>

          {/* <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <h3 className="text-sm font-bold text-red-700">Danger zone</h3>
            <p className="mt-1 text-xs text-red-500">
              Once you delete your account, there is no going back.
            </p>
            <button className="mt-3 rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition">
              Delete account
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
