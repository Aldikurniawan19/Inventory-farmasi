import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { FileText, Plus, Truck, Building2, Package, DollarSign } from "lucide-react";
import Swal from "sweetalert2";

const Purchasing = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [poList, setPoList] = useState([]);

  // State Form Buat PO
  const [newPO, setNewPO] = useState({
    supplierId: "",
    productId: "",
    qty: "",
    cost: "",
  });

  const loadData = () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

    fetch("http://localhost:5000/api/suppliers", { headers })
      .then((r) => r.json())
      .then(setSuppliers);
    fetch("http://localhost:5000/api/products", { headers })
      .then((r) => r.json())
      .then(setProducts);
    fetch("http://localhost:5000/api/purchase-orders", { headers })
      .then((r) => r.json())
      .then(setPoList);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handler Pilih Obat -> Otomatis isi Harga
  const handleProductChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedProduct = products.find((p) => p.id === selectedId);

    if (selectedProduct) {
      setNewPO({
        ...newPO,
        productId: selectedId,
        cost: selectedProduct.price,
      });
    } else {
      setNewPO({ ...newPO, productId: "", cost: "" });
    }
  };

  // Fungsi Buat PO
  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!newPO.supplierId || !newPO.productId || !newPO.qty || !newPO.cost) {
      return Swal.fire("Gagal", "Semua kolom wajib diisi!", "warning");
    }

    try {
      const res = await fetch("http://localhost:5000/api/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          supplierId: newPO.supplierId,
          items: [
            {
              productId: newPO.productId,
              qty: newPO.qty,
              costPrice: newPO.cost,
            },
          ],
        }),
      });

      if (res.ok) {
        Swal.fire("Berhasil", "PO berhasil diterbitkan.", "success");
        setNewPO({ supplierId: "", productId: "", qty: "", cost: "" });
        loadData();
      } else {
        Swal.fire("Gagal", "Terjadi kesalahan", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Koneksi server bermasalah", "error");
    }
  };

  // --- FUNGSI UTAMA: TERIMA BARANG (RESTOCK) ---
  const handleReceive = async (id) => {
    const result = await Swal.fire({
      title: "Konfirmasi Terima Barang",
      text: "Apakah fisik barang sudah datang? Stok akan otomatis ditambahkan ke gudang.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      confirmButtonText: "Ya, Barang Diterima",
    });

    if (result.isConfirmed) {
      try {
        // Panggil API Backend receivePO
        const res = await fetch(`http://localhost:5000/api/purchase-orders/${id}/receive`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const data = await res.json();

        if (res.ok) {
          Swal.fire("Stok Bertambah!", `Stok gudang telah diupdate.`, "success");
          loadData(); // Refresh tabel agar tombol berubah jadi "Selesai"
        } else {
          Swal.fire("Gagal", data.message, "error");
        }
      } catch (err) {
        Swal.fire("Error", "Gagal menghubungi server", "error");
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-blue-600" /> Procurement (PO)
            </h2>
            <p className="text-gray-500">Kelola pembelian barang dari Supplier/Pabrik.</p>
          </div>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold">Total PO: {poList.length}</div>
        </div>

        {/* FORM BUAT PO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
            <Plus className="bg-blue-100 text-blue-600 rounded p-1" size={24} /> Buat Purchase Order Baru
          </h3>
          <form onSubmit={handleCreatePO} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">SUPPLIER</label>
              <select className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm" value={newPO.supplierId} onChange={(e) => setNewPO({ ...newPO, supplierId: e.target.value })}>
                <option value="">-- Pilih Pabrik --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">OBAT</label>
              <select className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm" value={newPO.productId} onChange={handleProductChange}>
                <option value="">-- Pilih Obat --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">JUMLAH (QTY)</label>
              <input type="number" className="w-full p-2.5 border rounded-lg text-sm" placeholder="0" value={newPO.qty} onChange={(e) => setNewPO({ ...newPO, qty: e.target.value })} />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">HARGA BELI</label>
              <input type="number" className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm" placeholder="Otomatis" value={newPO.cost} onChange={(e) => setNewPO({ ...newPO, cost: e.target.value })} />
            </div>
            <div className="md:col-span-1">
              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-lg">
                + Terbitkan PO
              </button>
            </div>
          </form>
        </div>

        {/* LIST PO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="p-4">ID Dokumen</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Status</th>
                <th className="p-4">Detail Barang</th>
                <th className="p-4">Total Nilai</th>
                <th className="p-4 text-center">Aksi Gudang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {poList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    Belum ada history pembelian.
                  </td>
                </tr>
              ) : (
                poList.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-blue-600">PO-{String(po.id).padStart(4, "0")}</td>
                    <td className="p-4 font-medium text-gray-700">{po.supplier.name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${po.status === "RECEIVED" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{po.status === "RECEIVED" ? "DITERIMA" : "PENDING"}</span>
                    </td>
                    <td className="p-4">
                      {po.items.length > 0 && (
                        <div>
                          <span className="font-bold text-gray-800">ID Produk: {po.items[0].productId}</span>
                          <br />
                          <span className="text-xs text-gray-500">Qty: {po.items[0].qty} Unit</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-medium">Rp {po.totalAmount.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      {/* TOMBOL AKSI TERIMA BARANG */}
                      {po.status === "PENDING" ? (
                        <button onClick={() => handleReceive(po.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-xs font-bold flex items-center gap-2 mx-auto shadow-md">
                          <Truck size={14} /> Terima Barang
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic flex items-center justify-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span> Selesai
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Purchasing;
