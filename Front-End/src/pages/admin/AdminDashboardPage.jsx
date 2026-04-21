import { useEffect, useState } from "react";
import { getAdminOrders, getProductsPage } from "../../services/api";
import cartIcon from "../../assets/cart-plus-solid.png";
import productIcon from "../../assets/product-icon.svg";
import revenue from "../../assets/revenue.svg";
import userIcon from "../../assets/user-regular.svg";

const statusStyles = {
  Delivered: "bg-emerald-100 text-emerald-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-700",
};

function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productsCount, setProductsCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getProductsPage({ page: 1, limit: 100, sortBy: "stock", sort: "asc" }),
      getAdminOrders(),
    ])
      .then(([productsResult, adminOrders]) => {
        if (!cancelled) {
          setProducts(productsResult.products || []);
          setProductsCount(Number(productsResult.totalProducts || 0));
          setOrders(Array.isArray(adminOrders) ? adminOrders : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setProductsCount(0);
          setOrders([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isFulfilledStatus = (status) => {
    const normalized = String(status || "")
      .trim()
      .toLowerCase();
    return normalized === "delivered" || normalized === "shipped";
  };

  const toNumericAmount = (value) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const totalRevenue = orders
    .filter((order) => isFulfilledStatus(order.status))
    .reduce((sum, order) => sum + toNumericAmount(order.total), 0);

  const uniqueCustomers = new Set(
    orders.map((order) => order.email || order.customer || order.id),
  ).size;

  const stats = [
    {
      label: "Total revenue",
      value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      change: "live",
      up: true,
      icon: <img src={revenue} alt="revenue-icon" className="w-6 h-6" />,
    },
    {
      label: "Orders",
      value: orders.length.toLocaleString(),
      change: "live",
      up: true,
      icon: <img src={cartIcon} alt="cart-icon" className="w-6 h-6" />,
    },
    {
      label: "Products",
      value: productsCount.toLocaleString(),
      change: "active",
      up: true,
      icon: <img src={productIcon} alt="product-icon" className="w-6 h-6" />,
    },
    {
      label: "Customers",
      value: uniqueCustomers.toLocaleString(),
      change: "live",
      up: true,
      icon: <img src={userIcon} alt="user-icon" className="w-6 h-6" />,
    },
  ];

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.date || 0).getTime() -
        new Date(a.createdAt || a.date || 0).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Welcome back! Here is what is happening today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {stat.value}
            </p>
            <p
              className={`mt-1 text-xs font-semibold ${stat.up ? "text-emerald-600" : "text-red-500"}`}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Recent orders</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {["Order", "Customer", "Status", "Total"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.customer}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      ${Number(order.total || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Low stock alert
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {products
              .filter((p) => p.stock <= 15)
              .map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">{product.category}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.stock <= 10 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}
                  >
                    {product.stock} left
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
