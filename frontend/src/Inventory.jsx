import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { Save, PlusCircle, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

const Inventory = () => {
  // State untuk form
  const [products, setProducts] = useState([]); // Data untuk dropdown
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState("");
  const [message, setMessage] = useState(null); // Pesan sukses/gagal

  // 1. Ambil daftar obat saat halaman dibuka (untuk isi dropdown)
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  // 2. Fungsi saat tombol Simpan ditekan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedId || !qty) return;

    try {
      const response = await fetch("http://localhost:5000/api/products/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedId,
          qty: qty,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // GANTI BAGIAN setMessage DENGAN INI:
        Swal.fire({
          icon: "success",
          title: "Stok Bertambah!",
          html: `Stok <b>${result.data.name}</b> sekarang menjadi: <b>${result.data.stock}</b>`,
          confirmButtonText: "Oke",
        });
        setQty("");
      } else {
        // Ganti pesan error
        Swal.fire("Gagal", result.message, "error");
      }
    } catch (error) {
      setMessage({ type: "error", text: "Gagal menghubungi server" });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <PlusCircle className="text-blue-600" /> Input Barang Masuk
        </h2>

        {/* Notifikasi Pesan */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            <AlertCircle size={20} /> {message.text}
          </div>
        )}

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pilihan Obat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Obat</label>
              <select className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required>
                <option value="">-- Cari Nama Obat --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Sisa: {p.stock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Input Jumlah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Masuk</label>
              <input type="number" min="1" placeholder="Contoh: 50" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={qty} onChange={(e) => setQty(e.target.value)} required />
            </div>

            {/* Tombol Aksi */}
            <div className="pt-4">
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2">
                <Save size={20} /> Simpan Stok
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Inventory;
