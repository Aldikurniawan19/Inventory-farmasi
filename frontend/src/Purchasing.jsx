import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { FileText, Plus, Check, Truck } from "lucide-react";
import Swal from "sweetalert2"; // Tambahkan ini

const Purchasing = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [poList, setPoList] = useState([]);

  // State Form Buat PO
  const [newPO, setNewPO] = useState({ supplierId: "", productId: "", qty: "", cost: "" });

  // Load Data Awal
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

  // Fungsi Buat PO
  const handleCreatePO = async (e) => {
    e.preventDefault();
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
        alert("PO Berhasil Dibuat!");
        loadData(); // Refresh list
      }
    } catch (err) {
      alert("Gagal");
    }
  };

  // Fungsi Terima Barang (Receive)
  // Fungsi Terima Barang dengan SweetAlert
  const handleReceive = async (id) => {
    // 1. Tampilkan Popup Konfirmasi
    const result = await Swal.fire({
      title: "Terima Barang?",
      text: "Pastikan fisik barang sudah sesuai dengan PO.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6", // Warna Biru
      cancelButtonColor: "#d33", // Warna Merah
      confirmButtonText: "Ya, Terima Barang!",
      cancelButtonText: "Batal",
    });

    // Jika user klik Batal, berhenti di sini
    if (!result.isConfirmed) return;

    // 2. Lakukan Request ke Server
    try {
      const res = await fetch(`http://localhost:5000/api/purchase-orders/${id}/receive`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.ok) {
        // 3. Tampilkan Pesan Sukses
        Swal.fire({
          title: "Berhasil!",
          text: "Stok gudang telah ditambahkan otomatis.",
          icon: "success",
          timer: 2000, // Tutup otomatis dalam 2 detik
          showConfirmButton: false,
        });
        loadData(); // Refresh data
      } else {
        Swal.fire("Gagal", "Terjadi kesalahan saat update stok", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Gagal koneksi ke server", "error");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-blue-600" /> Purchasing & Procurement
        </h2>

        {/* FORM BUAT PO SEDERHANA */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold mb-4 text-gray-700">Buat Purchase Order (PO) Baru</h3>
          <form onSubmit={handleCreatePO} className="flex gap-4 items-end flex-wrap">
            <div>
              <label className="text-xs font-bold text-gray-500">Supplier</label>
              <select className="border p-2 rounded w-48 block" onChange={(e) => setNewPO({ ...newPO, supplierId: e.target.value })}>
                <option value="">Pilih Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Obat</label>
              <select className="border p-2 rounded w-48 block" onChange={(e) => setNewPO({ ...newPO, productId: e.target.value })}>
                <option value="">Pilih Obat</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Jumlah</label>
              <input type="number" className="border p-2 rounded w-24 block" placeholder="Qty" onChange={(e) => setNewPO({ ...newPO, qty: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Harga Beli</label>
              <input type="number" className="border p-2 rounded w-32 block" placeholder="Rp" onChange={(e) => setNewPO({ ...newPO, cost: e.target.value })} />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">
              + Buat PO
            </button>
          </form>
        </div>

        {/* LIST PO */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">ID PO</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Status</th>
                <th className="p-4">Total</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {poList.map((po) => (
                <tr key={po.id}>
                  <td className="p-4 font-bold">#PO-{po.id}</td>
                  <td className="p-4">{po.supplier.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${po.status === "RECEIVED" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{po.status}</span>
                  </td>
                  <td className="p-4">Rp {po.totalAmount.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    {po.status === "PENDING" && (
                      <button onClick={() => handleReceive(po.id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs flex items-center gap-1 ml-auto">
                        <Truck size={14} /> Terima Barang
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Purchasing;
