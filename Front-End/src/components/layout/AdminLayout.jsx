import { NavLink, Outlet } from "react-router-dom";
import dashboardSvg from "../../assets/dash-board.svg";
import productIcon from "../../assets/product-icon.svg";
import receipt from "../../assets/receipt-solid.svg";
import user from "../../assets/user-regular.svg";

const adminLinks = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: <img src={dashboardSvg} alt="" className="h-4 w-4" />,
  },
  {
    label: "Products",
    to: "/admin/products",
    icon: <img src={productIcon} alt="" className="h-4 w-4" />,
  },
  {
    label: "Orders",
    to: "/admin/orders",
    icon: <img src={receipt} alt="" className="h-4 w-4" />,
  },
  {
    label: "Users",
    to: "/admin/users",
    icon: <img src={user} alt="" className="h-4 w-4" />,
  },
];

function AdminLayout() {
  return (
    <div className="flex min-h-screen gap-0">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white sm:block">
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Admin panel
          </p>
          <nav className="mt-4 space-y-1">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/admin"}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100",
                  ].join(" ")
                }
              >
                <span>{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile tabs */}
      <div className="w-full">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 sm:hidden">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/admin"}
              className={({ isActive }) =>
                [
                  "shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition",
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100",
                ].join(" ")
              }
            >
              {link.icon} {link.label}
            </NavLink>
          ))}
        </div>
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
