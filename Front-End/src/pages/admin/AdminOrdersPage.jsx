import { useEffect, useState } from "react";
import { getAdminOrders, updateOrderStatus } from "../../services/api";
import { useToast } from "../../context/ToastContext";

const ALL_STATUSES = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

const statusStyles = {
  Delivered: "bg-emerald-100 text-emerald-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-700",
};

function OrderProductsCell({ order }) {
  const previewItems = Array.isArray(order.products)
    ? order.products.slice(0, 2)
    : [];

  if (previewItems.length === 0) {
    return <p className="text-xs text-slate-400">No product details</p>;
  }

  return (
    <div className="space-y-1">
      {previewItems.map((item, index) => (
        <p
          key={`${order.id}-${item.productId}-${index}`}
          className="truncate text-xs text-slate-500"
        >
          {item.name} × {item.quantity}
        </p>
      ))}
      {order.products.length > previewItems.length && (
        <p className="text-xs text-slate-400">
          +{order.products.length - previewItems.length} more
        </p>
      )}
    </div>
  );
}

function AdminOrdersPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getAdminOrders()
      .then(setOrders)
      .catch((error) => {
        toast({
          message: error.message || "Failed to load orders.",
          type: "error",
        });
      });
  }, [toast]);

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "All" || o.status === filter;
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  async function handleStatusChange(orderId, status) {
    try {
      const normalizedId = orderId.replace(/^#/, "");
      const result = await updateOrderStatus(normalizedId, status);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? result.order : order)),
      );
      toast({
        message: `Order ${orderId} updated to ${status}.`,
        type: "success",
      });
    } catch (error) {
      toast({
        message: error.message || "Failed to update status.",
        type: "error",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filter === s ? "bg-indigo-600 text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-100"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search orders or customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:max-w-xs"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {[
                "Order ID",
                "Customer",
                "Products",
                "Date",
                "Items",
                "Total",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {order.id}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{order.customer}</p>
                  <p className="text-xs text-slate-400">{order.email}</p>
                </td>
                <td className="px-4 py-3">
                  <OrderProductsCell order={order} />
                </td>
                <td className="px-4 py-3 text-slate-600">{order.date}</td>
                <td className="px-4 py-3 text-slate-600">{order.items}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  ${Number(order.total).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
                  >
                    {["Processing", "Shipped", "Delivered", "Cancelled"].map(
                      (s) => (
                        <option key={s}>{s}</option>
                      ),
                    )}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrdersPage;
