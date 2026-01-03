import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { Truck, Package, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";

const Shipping = () => {
  const [orders, setOrders] = useState([]);

  // Ambil data pesanan masuk saat halaman dibuka
  const fetchOrders = () => {
    fetch("http://localhost:5000/api/orders/incoming", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fungsi Tombol "Proses Kirim"
  const handleShip = async (orderId) => {
    // Konfirmasi Cantik
    const result = await Swal.fire({
      title: "Kirim Pesanan?",
      text: "Stok akan dipotong & status berubah jadi SHIPPED.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981", // Hijau
      cancelButtonColor: "#6B7280", // Abu-abu
      confirmButtonText: "Ya, Proses Kirim!",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/ship`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const dataResult = await res.json();

      if (res.ok) {
        Swal.fire("Terkirim!", "Barang berhasil diproses keluar.", "success");
        fetchOrders();
      } else {
        Swal.fire("Gagal", dataResult.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Koneksi server bermasalah", "error");
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Truck className="text-blue-600" /> Manajemen Pengiriman
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow border">
            <p className="text-gray-500">Tidak ada pesanan baru yang perlu diproses.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Pesanan #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      Pemesan: <span className="font-semibold text-blue-600">{order.user.name}</span>
                    </p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Siap Dikirim</span>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Detail Barang:</p>
                  <ul className="space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span>{item.product.name}</span>
                        <span className="font-mono font-bold">
                          x {item.qty} {item.product.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end pt-2">
                  <button onClick={() => handleShip(order.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition">
                    <CheckCircle size={18} /> Proses & Potong Stok
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Shipping;
