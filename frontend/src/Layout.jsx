import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, LogOut, User, Truck, BarChart3, FileText, Menu } from "lucide-react";
import Swal from "sweetalert2";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    Swal.fire({
      title: "Keluar Sistem?",
      text: "Sesi login Anda akan diakhiri.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Keluar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      }
    });
  };

  // Menu Config
  const menus = [{ name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> }];

  if (user.role === "GUDANG") {
    menus.push({ name: "Kelola Stok", path: "/inventory", icon: <Package size={20} /> });
    menus.push({ name: "Pengiriman", path: "/shipping", icon: <Truck size={20} /> });
    menus.push({ name: "Laporan", path: "/reports", icon: <BarChart3 size={20} /> });
  } else if (user.role === "APOTEK") {
    menus.push({ name: "Pesanan Saya", path: "/orders", icon: <ShoppingCart size={20} /> });
  } else if (user.role === "PURCHASING") {
    menus.push({ name: "Pembelian (PO)", path: "/purchasing", icon: <FileText size={20} /> });
    menus.push({ name: "Laporan", path: "/reports", icon: <BarChart3 size={20} /> });
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* SIDEBAR DARK THEME */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 shadow-2xl">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="bg-indigo-500 p-2 rounded-lg shadow-lg shadow-indigo-500/50">
            <Package size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Pharma<span className="text-indigo-400">Dist</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Enterprise System</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase mb-2">Menu Utama</p>
          {menus.map((menu, idx) => {
            const isActive = location.pathname === menu.path;
            return (
              <button
                key={idx}
                onClick={() => navigate(menu.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 translate-x-1" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className={isActive ? "text-white" : "text-slate-500 group-hover:text-white"}>{menu.icon}</span>
                {menu.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl text-sm font-medium transition-colors">
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Modern Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">{menus.find((m) => m.path === location.pathname)?.name || "Halaman"}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700">{user.name || "User"}</p>
              <p className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded-full inline-block">{user.role}</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <User size={20} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8 bg-slate-50">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
