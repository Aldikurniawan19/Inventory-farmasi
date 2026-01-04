import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { PackageCheck, Truck, Clock, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    fetch("http://localhost:5000/api/orders/my", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Konfirmasi Terima Barang
  const handleConfirmReceived = async (orderId) => {
    const result = await Swal.fire({
      title: "Barang Sudah Sampai?",
      text: "Pastikan fisik barang sudah Anda terima dengan baik.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981", // Hijau
      confirmButtonText: "Ya, Sudah Diterima",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}/complete`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.ok) {
          Swal.fire("Terima Kasih!", "Transaksi selesai.", "success");
          fetchOrders();
        } else {
          Swal.fire("Gagal", "Terjadi kesalahan", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Koneksi server bermasalah", "error");
      }
    }
  };

  // Helper Status Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "PROCESSING":
        return (
          <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock size={12} /> Diproses Gudang
          </span>
        );
      case "SHIPPED":
        return (
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Truck size={12} /> Dalam Pengiriman
          </span>
        );
      case "COMPLETED":
        return (
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle size={12} /> Selesai
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <PackageCheck className="text-blue-600" /> Riwayat Pesanan
          </h2>
          <p className="text-gray-500">Pantau status pesanan dan konfirmasi penerimaan barang.</p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center">Memuat...</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Order #{order.id}</h3>
                    <p className="text-xs text-gray-400">Dibuat pada: {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status)}

                    {/* TOMBOL KONFIRMASI (Hanya muncul jika status SHIPPED) */}
                    {order.status === "SHIPPED" && (
                      <button onClick={() => handleConfirmReceived(order.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition">
                        Konfirmasi Barang Sampai
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm text-gray-600 border-b border-gray-50 last:border-0 pb-1">
                        <span>{item.product.name}</span>
                        <span className="font-mono font-bold">
                          x {item.qty} {item.product.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-2 border-t border-gray-100 text-right">
                    <p className="text-sm text-gray-500">Total Tagihan:</p>
                    <p className="text-xl font-bold text-blue-600">Rp {order.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyOrders;
