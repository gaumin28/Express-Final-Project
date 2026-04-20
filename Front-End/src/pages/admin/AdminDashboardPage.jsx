import { useEffect, useState } from "react";
import { getProducts } from "../../services/api";

const stats = [
  {
    label: "Total revenue",
    value: "$12,480",
    change: "+12%",
    up: true,
    icon: "💰",
  },
  { label: "Orders", value: "148", change: "+8%", up: true, icon: "🛒" },
  { label: "Products", value: "8", change: "active", up: true, icon: "📦" },
  { label: "Customers", value: "94", change: "+5%", up: true, icon: "👥" },
];

const recentOrders = [
  {
    id: "#ORD-8830",
    customer: "Alice Brown",
    date: "Mar 22, 2026",
    total: "$189",
    status: "Processing",
  },
  {
    id: "#ORD-8829",
    customer: "Bob Smith",
    date: "Mar 21, 2026",
    total: "$79",
    status: "Shipped",
  },
  {
    id: "#ORD-8828",
    customer: "Carol White",
    date: "Mar 20, 2026",
    total: "$224",
    status: "Delivered",
  },
  {
    id: "#ORD-8827",
    customer: "Dan Lee",
    date: "Mar 19, 2026",
    total: "$35",
    status: "Delivered",
  },
];

const statusStyles = {
  Delivered: "bg-emerald-100 text-emerald-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-700",
};

function AdminDashboardPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    getProducts()
      .then((items) => {
        if (!cancelled) {
          setProducts(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
              {stat.change} vs last month
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
                      {order.total}
                    </td>
                  </tr>
                ))}
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
