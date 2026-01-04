import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { Loader, AlertCircle, Clock, Activity, User } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({ totalItems: 0, lowStock: 0, totalValue: 0 });
  const [activities, setActivities] = useState([]); // Data Log
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

        // 1. Ambil Data Produk (Untuk Card Statistik)
        const resProd = await fetch("http://localhost:5000/api/products");
        const products = await resProd.json();

        // Hitung Statistik
        const totalItems = products.length;
        const lowStock = products.filter((p) => p.stock < 10).length;
        const totalValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
        setStats({ totalItems, lowStock, totalValue });

        // 2. Ambil Data Log Aktivitas (API Baru)
        const resLog = await fetch("http://localhost:5000/api/logs", { headers });
        if (resLog.ok) {
          const logs = await resLog.json();
          setActivities(logs);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      {loading && (
        <div className="flex justify-center p-20">
          <Loader className="animate-spin text-blue-600" />
        </div>
      )}

      {!loading && (
        <div className="space-y-8">
          {/* STATS CARDS (Sama seperti sebelumnya) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">TOTAL SKU</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.totalItems}</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-400">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">PESANAN BARU</p>
              <h3 className="text-3xl font-bold text-gray-800">5</h3> {/* Masih dummy/placeholder */}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ASET GUDANG</p>
              <h3 className="text-2xl font-bold text-gray-800 truncate">Rp {stats.totalValue.toLocaleString("id-ID")}</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">STOK KRITIS</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.lowStock}</h3>
            </div>
          </div>

          {/* TABEL LOG AKTIVITAS REAL-TIME */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <Activity size={20} className="text-blue-600" /> Log Aktivitas User
                </h3>
                <p className="text-sm text-gray-500">Memantau login dan tindakan pengelolaan stok secara real-time.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-xs border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-6">WAKTU</th>
                    <th className="py-3 px-6">USER</th>
                    <th className="py-3 px-6">TIPE AKSI</th>
                    <th className="py-3 px-6">DETAIL AKTIVITAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {activities.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-gray-400">
                        Belum ada aktivitas terekam.
                      </td>
                    </tr>
                  ) : (
                    activities.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition">
                        <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            {new Date(log.createdAt).toLocaleString("id-ID")}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">{log.user.name.charAt(0)}</div>
                            <div>
                              <p className="font-bold text-gray-700">{log.user.name}</p>
                              <p className="text-[10px] text-gray-400 uppercase">{log.user.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-bold border ${
                              log.action === "LOGIN"
                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                : log.action === "RESTOCK"
                                ? "bg-green-50 text-green-600 border-green-100"
                                : log.action === "SHIPPING"
                                ? "bg-orange-50 text-orange-600 border-orange-100"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700 font-medium">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
