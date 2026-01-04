import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { BarChart3, Download, FileSpreadsheet, DollarSign, ShoppingCart, Package, Box, Loader } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil Data Statistik Dashboard
  useEffect(() => {
    fetch("http://localhost:5000/api/reports", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDownload = (type) => {
    const token = localStorage.getItem("token");
    const url = `http://localhost:5000/api/reports/${type}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `Laporan_${type}_${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      });
  };

  const formatRupiah = (val) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  // Warna untuk Pie Chart
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
                  <ShoppingCart size={24} /> {stats.orders} Transaksi
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
                  <Box size={24} /> {stats.stock} Unit
                </h3>
              </div>
            </div>

            {/* 2. CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart Kiri: Top 5 Stok (Lebar 2/3) */}
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

              {/* Chart Kanan: Status Pesanan (Lebar 1/3) */}
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

            {/* 3. DOWNLOAD SECTION (TETAP ADA) */}
            {/* ... kode grafik di atasnya ... */}

            {/* 3. DOWNLOAD SECTION */}
            <h3 className="font-bold text-lg text-gray-800 mt-4">Unduh Data Laporan</h3>

            {/* UBAH GRID JADI 3 KOLOM (md:grid-cols-3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Stok (BARU) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                    <Package size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Laporan Stok</h4>
                    <p className="text-sm text-gray-500">Data ketersediaan barang saat ini</p>
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
                    <p className="text-sm text-gray-500">Data transaksi keluar (Sales)</p>
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
                    <p className="text-sm text-gray-500">Data belanja Supplier (PO)</p>
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
          </>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
