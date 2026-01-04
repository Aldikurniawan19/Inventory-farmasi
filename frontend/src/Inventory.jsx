import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { Search, Filter, Plus, Package, MapPin, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 1. Fetch Data Master Obat
  const fetchProducts = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 2. FUNGSI TAMBAH OBAT BARU (Master Data)
  const handleAddProduct = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Tambah Master Obat Baru",
      html:
        '<input id="swal-name" class="swal2-input" placeholder="Nama Obat (Cth: Panadol)">' +
        '<select id="swal-type" class="swal2-input">' +
        '<option value="Obat Bebas">Obat Bebas</option>' +
        '<option value="Obat Keras">Obat Keras</option>' +
        '<option value="Alat Kesehatan">Alat Kesehatan</option>' +
        "</select>" +
        '<input id="swal-unit" class="swal2-input" placeholder="Satuan (Cth: Box/Strip)">' +
        '<input id="swal-price" type="number" class="swal2-input" placeholder="Harga Jual (Rp)">' +
        '<input id="swal-loc" class="swal2-input" placeholder="Lokasi Rak (Cth: A-1)">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan Data",
      preConfirm: () => {
        return {
          name: document.getElementById("swal-name").value,
          type: document.getElementById("swal-type").value,
          unit: document.getElementById("swal-unit").value,
          price: document.getElementById("swal-price").value,
          location: document.getElementById("swal-loc").value,
        };
      },
    });

    if (formValues) {
      if (!formValues.name || !formValues.price) return Swal.fire("Gagal", "Nama dan Harga wajib diisi", "error");

      try {
        const res = await fetch("http://localhost:5000/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues),
        });

        if (res.ok) {
          Swal.fire("Sukses", "Master obat baru berhasil ditambahkan. Stok awal: 0", "success");
          fetchProducts();
        } else {
          Swal.fire("Gagal", "Terjadi kesalahan server", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Koneksi bermasalah", "error");
      }
    }
  };

  // Filter & Pagination Logic
  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.type.toLowerCase().includes(searchTerm.toLowerCase()));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Chart Data
  const lowStockCount = products.filter((p) => p.stock < 10).length;
  const chartData = [
    { name: "Stok Aman", value: products.length - lowStockCount },
    { name: "Stok Menipis (<10)", value: lowStockCount },
  ];
  const COLORS = ["#3B82F6", "#EF4444"];

  return (
    <Layout>
      <div className="space-y-6">
        {/* CHART RINGKASAN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
            <h3 className="font-bold text-gray-700 mb-2 w-full text-left">Status Gudang</h3>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="md:col-span-2 bg-gradient-to-r from-[#1A2332] to-[#252D3D] rounded-xl shadow-lg p-8 text-white flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-2">Master Data Obat</h2>
            <p className="opacity-90 mb-6 text-sm text-gray-300">
              Halaman ini hanya menampilkan katalog obat yang terdaftar di sistem. <br />
              Untuk menambah stok fisik, silakan lakukan <b>Pembelian (PO)</b> ke Pabrik.
            </p>
            <div className="flex gap-8">
              <div>
                <span className="text-3xl font-bold block">{products.length}</span>
                <span className="text-sm opacity-75">Total SKU</span>
              </div>
              <div>
                <span className="text-3xl font-bold block text-red-400">{lowStockCount}</span>
                <span className="text-sm opacity-75">Perlu PO</span>
              </div>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama obat..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {/* Tombol Tambah Produk AKTIF */}
            <button onClick={handleAddProduct} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-lg transition">
              <Plus size={18} /> Tambah Obat Baru
            </button>
          </div>
        </div>

        {/* TABEL DATA (TANPA TOMBOL RESTOCK) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="py-4 px-6">Nama Produk</th>
                <th className="py-4 px-6">Kategori</th>
                <th className="py-4 px-6">Lokasi</th>
                <th className="py-4 px-6 text-right">Harga Jual</th>
                <th className="py-4 px-6 text-center">Stok Fisik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8">
                    Loading...
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-800">{item.name}</td>
                    <td className="py-4 px-6">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.type}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} /> {item.location}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-medium">Rp {item.price.toLocaleString("id-ID")}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full font-bold text-xs ${item.stock < 10 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>{item.stock} Unit</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
            <span>
              Halaman {currentPage} dari {totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Inventory;
