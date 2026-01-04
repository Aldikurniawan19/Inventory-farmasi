import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { ClipboardList, CheckCircle, Package } from "lucide-react";
import Swal from "sweetalert2";

const IncomingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data status PROCESSING
  const fetchOrders = () => {
    fetch("http://localhost:5000/api/orders/incoming", {
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

  // Fungsi Proses Kirim
  const handleProcess = async (orderId) => {
    const result = await Swal.fire({
      title: "Proses Pesanan?",
      text: "Stok akan dipotong dan masuk ke menu Pengiriman.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3B82F6",
      confirmButtonText: "Ya, Kirim Barang",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}/ship`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.ok) {
          Swal.fire("Berhasil", "Pesanan dipindahkan ke Pengiriman", "success");
          fetchOrders(); // Refresh list
        } else {
          const data = await res.json();
          Swal.fire("Gagal", data.message, "error");
        }
      } catch (err) {
        Swal.fire("Error", "Koneksi server bermasalah", "error");
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Pesanan Masuk</h2>
            <p className="text-gray-500">Daftar permintaan barang dari Apotek/RS yang perlu diproses.</p>
          </div>
          <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <ClipboardList size={20} /> {orders.length} Pending
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <p className="text-center py-10">Memuat pesanan...</p>
          ) : orders.length === 0 ? (
            <p className="text-center py-10 text-gray-500 bg-white rounded-xl">Tidak ada pesanan masuk saat ini.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-blue-600">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      Pemesan: <span className="font-bold text-gray-700">{order.user.name}</span>
                    </p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Perlu Diproses</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Detail Item:</p>
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm text-gray-700 border-b border-gray-200 pb-1 last:border-0">
                        <span className="flex items-center gap-2">
                          <Package size={14} /> {item.product.name}
                        </span>
                        <span className="font-bold">
                          x {item.qty} {item.product.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => handleProcess(order.id)} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 transition">
                    <CheckCircle size={18} /> Proses & Kirim
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default IncomingOrders;
