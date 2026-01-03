import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3, TrendingUp, DollarSign, Package } from "lucide-react";

const Reports = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/reports", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error(err));
  }, []);

  if (!data)
    return (
      <Layout>
        <div className="p-8">Memuat Data Analitik...</div>
      </Layout>
    );

  // Warna untuk Pie Chart
  const COLORS = ["#F59E0B", "#3B82F6", "#10B981"]; // Kuning, Biru, Hijau

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="text-blue-600" /> Laporan & Analitik
        </h2>

        {/* 1. KARTU RINGKASAN (SUMMARY CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Total Pendapatan</p>
            <h3 className="text-2xl font-bold text-green-600 flex items-center">
              <DollarSign size={20} /> Rp {data.summary.totalRevenue.toLocaleString()}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Total Pesanan</p>
            <h3 className="text-2xl font-bold text-blue-600 flex items-center">
              <TrendingUp size={20} className="mr-2" /> {data.summary.totalOrders} Transaksi
            </h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Total SKU Obat</p>
            <h3 className="text-2xl font-bold text-purple-600 flex items-center">
              <Package size={20} className="mr-2" /> {data.summary.totalProducts} Jenis
            </h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Total Stok Fisik</p>
            <h3 className="text-2xl font-bold text-gray-700">{data.summary.totalStock} Unit</h3>
          </div>
        </div>

        {/* 2. AREA GRAFIK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grafik Batang: Stok Obat */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold text-gray-700 mb-4">Stok Obat (Top 5)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stockData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#3B82F6" name="Jumlah Stok" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grafik Pie: Status Pesanan */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold text-gray-700 mb-4">Status Pesanan</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.orderStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {data.orderStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
