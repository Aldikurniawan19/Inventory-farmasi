import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { Loader, AlertCircle, Package, TrendingUp, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal ambil data");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Hitung Data Ringkas
  const totalItems = products.length;
  const lowStockItems = products.filter((p) => p.stock < 10).length;
  const totalValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);

  return (
    <Layout>
      {loading && (
        <div className="flex justify-center p-20">
          <Loader className="animate-spin text-indigo-600" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex gap-3 mb-6">
          <AlertCircle /> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          {/* STATS CARDS dengan Gradient */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-50 rounded-full blur-xl opacity-50"></div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Produk</p>
                  <h3 className="text-2xl font-bold text-slate-800">{totalItems} SKU</h3>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-50 rounded-full blur-xl opacity-50"></div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Nilai Aset</p>
                  <h3 className="text-2xl font-bold text-slate-800">Rp {totalValue.toLocaleString("id-ID")}</h3>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-rose-50 rounded-full blur-xl opacity-50"></div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Stok Menipis</p>
                  <h3 className="text-2xl font-bold text-slate-800">{lowStockItems} Item</h3>
                </div>
              </div>
            </div>
          </div>

          {/* TABEL MODERN */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-lg text-slate-800">Inventaris Gudang</h3>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Live Data</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6">Nama Produk</th>
                    <th className="py-4 px-6">Tipe</th>
                    <th className="py-4 px-6">Lokasi</th>
                    <th className="py-4 px-6 text-right">Harga</th>
                    <th className="py-4 px-6 text-center">Status Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-800">{item.name}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === "Obat Keras" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{item.type}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">{item.location}</td>
                      <td className="py-4 px-6 text-right font-medium">Rp {item.price.toLocaleString("id-ID")}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`font-bold text-lg ${item.stock < 10 ? "text-red-500" : "text-emerald-600"}`}>{item.stock}</span>
                          <span className="text-[10px] text-slate-400">{item.unit}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
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
