import React, { useState, useEffect } from "react";
import Layout from "./Layout";

// --- 1. IMPORT IKON DARI 'lucide-react' ---
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  TrendingUp,
  ShoppingBag,
  Loader,
  Package, // Ikon Paket (Stok)
  Database, // Ikon Database (Backup)
  ShieldCheck, // Ikon Keamanan (Backup)
} from "lucide-react";

// --- 2. IMPORT GRAFIK DARI 'recharts' ---
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil Data Statistik Dashboard
  useEffect(() => {
    fetch("http://localhost:5000/api/reports", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal fetch");
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Fungsi Download (Support PDF & JSON)
  const handleDownload = (type, extension = "pdf") => {
    const token = localStorage.getItem("token");
    const url = `http://localhost:5000/api/reports/${type}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `Laporan_${type}_${new Date().toISOString().split("T")[0]}.${extension}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch((err) => console.error("Gagal download", err));
  };

  const formatRupiah = (val) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
  const COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#EF4444"];

  return (
    <Layout>
      <div className="space-y-8">
        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-indigo-600" /> Laporan & Analitik
          </h2>
          <p className="text-gray-500">Ringkasan performa bisnis dan operasional gudang.</p>
        </div>

        {loading || !stats ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* 1. CARD RINGKASAN */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
                <h3 className="text-2xl font-bold text-green-600 flex items-center gap-2">{formatRupiah(stats.revenue)}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Total Pesanan</p>
                <h3 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                  <ShoppingBag size={24} /> {stats.orders} Transaksi
                </h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Total SKU Obat</p>
                <h3 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
                  <Package size={24} /> {stats.sku} Jenis
                </h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Total Stok Fisik</p>
                <h3 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
                  <Package size={24} /> {stats.stock} Unit
                </h3>
              </div>
            </div>

            {/* 2. CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart Kiri: Top 5 Stok */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4">Stok Obat (Top 5)</h3>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topProducts}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="stock" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart Kanan: Status Pesanan */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4">Status Pesanan</h3>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {stats.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 3. DOWNLOAD SECTION (PDF) */}
            <h3 className="font-bold text-lg text-gray-800 mt-4">Unduh Data Laporan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Stok */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                    <Package size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Laporan Stok</h4>
                    <p className="text-sm text-gray-500">Data ketersediaan barang (PDF)</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload("stock")}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-purple-50 hover:text-purple-600 font-medium transition"
                >
                  <Download size={18} /> Unduh PDF
                </button>
              </div>

              {/* Card 2: Pengiriman */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-green-100 p-3 rounded-lg text-green-600">
                    <FileSpreadsheet size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Laporan Pengiriman</h4>
                    <p className="text-sm text-gray-500">Data transaksi keluar (PDF)</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload("shipping")}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-600 font-medium transition"
                >
                  <Download size={18} /> Unduh PDF
                </button>
              </div>

              {/* Card 3: Pembelian */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                    <FileSpreadsheet size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Laporan Pembelian</h4>
                    <p className="text-sm text-gray-500">Data belanja Supplier (PDF)</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload("purchasing")}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium transition"
                >
                  <Download size={18} /> Unduh PDF
                </button>
              </div>
            </div>

            {/* 4. BACKUP SECTION (JSON) */}
            <h3 className="font-bold text-lg text-gray-800 mt-8">Database & Keamanan</h3>
            <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-slate-700 p-4 rounded-full">
                  <Database size={32} className="text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-xl">Backup Data Gudang Lengkap</h4>
                  <p className="text-slate-300 text-sm max-w-lg">Unduh seluruh data database (User, Produk, Pesanan, Supplier, Log) dalam format JSON untuk cadangan pemulihan sistem.</p>
                </div>
              </div>
              <button onClick={() => handleDownload("backup", "json")} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition shadow-lg shadow-blue-900/50 whitespace-nowrap">
                <ShieldCheck size={20} /> Backup Sekarang
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
