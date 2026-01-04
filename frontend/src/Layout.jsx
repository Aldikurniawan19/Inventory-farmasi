import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, LogOut, User, Truck, BarChart3, FileText, ClipboardList, Store, History } from "lucide-react";
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
      confirmButtonText: "Ya, Keluar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      }
    });
  };

  // Definisi Menu Berdasarkan Role
  let menus = [];
  if (user.role === "GUDANG") {
    menus = [
      { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "Data Obat", path: "/inventory", icon: <Package size={20} /> },

      // MENU 1: TERIMA ORDER DARI APOTEK
      { name: "Pesanan Masuk", path: "/incoming-orders", icon: <ClipboardList size={20} /> },

      { name: "Pembelian (PO)", path: "/purchasing", icon: <ShoppingCart size={20} /> },

      // MENU 2: LIHAT RIWAYAT PENGIRIMAN
      { name: "Pengiriman", path: "/shipping", icon: <Truck size={20} /> },

      { name: "Laporan", path: "/reports", icon: <BarChart3 size={20} /> },
    ];
  } else if (user.role === "APOTEK") {
    menus = [
      { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },

      // MENU BARU 1: KATALOG
      { name: "Pesan Obat", path: "/medicine-catalog", icon: <Store size={20} /> },

      // MENU BARU 2: RIWAYAT & KONFIRMASI
      { name: "Riwayat Pesanan", path: "/my-orders", icon: <History size={20} /> },
    ];
  } else {
    // Fallback untuk role lain agar tidak error
    menus = [{ name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> }];
  }

  const currentMenu = menus.find((m) => m.path === location.pathname)?.name || "Dashboard";

  return (
    <div className="flex h-screen bg-[#F5F7FA] font-sans">
      {/* SIDEBAR SESUAI MOCKUP */}
      <aside className="w-64 bg-[#1A2332] text-white flex flex-col">
        <div className="h-24 flex items-center px-6">
          <h1 className="text-xl font-bold leading-tight">
            Gudang Distributor <br /> Farmasi
          </h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {menus.map((menu, idx) => {
            const isActive = location.pathname === menu.path;
            return (
              <button
                key={idx}
                onClick={() => menu.path !== "#" && navigate(menu.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#3B82F6] text-white" // Warna biru terang saat aktif
                    : "text-gray-400 hover:text-white hover:bg-[#252D3D]"
                }`}
              >
                {menu.icon}
                {menu.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-[#252D3D] rounded-lg text-sm font-medium transition-colors">
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Sesuai Mockup */}
        <header className="h-24 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{currentMenu}</h2>
            <p className="text-gray-500">Sistem Informasi Manajemen Apotek & Distributor</p>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-full pr-4 border">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 relative">
              <User size={20} />
              {/* Status Dot */}
              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-400"></span>
            </div>
            <div className="text-sm">
              <p className="font-bold text-gray-700">
                {user.role || "User"}: {user.name || "Budi Santoso"}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
