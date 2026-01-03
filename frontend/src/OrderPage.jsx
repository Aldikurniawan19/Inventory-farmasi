import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { ShoppingCart, CheckCircle } from "lucide-react";

const OrderPage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({}); // Format: { id_produk: jumlah }

  // Ambil data produk
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  // Fungsi tambah ke keranjang
  const handleQtyChange = (id, qty) => {
    setCart((prev) => ({ ...prev, [id]: parseInt(qty) || 0 }));
  };

  // Fungsi Checkout
  const handleCheckout = async () => {
    // Ubah format cart menjadi array untuk dikirim ke API
    const itemsToSend = Object.keys(cart)
      .filter((id) => cart[id] > 0)
      .map((id) => ({ productId: id, qty: cart[id] }));

    if (itemsToSend.length === 0) return alert("Pilih minimal 1 obat!");

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Wajib kirim token!
        },
        body: JSON.stringify({ items: itemsToSend }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Pesanan Berhasil Dibuat! Status: PROCESSING");
        setCart({}); // Kosongkan keranjang
      } else {
        alert("Gagal: " + result.message);
      }
    } catch (err) {
      alert("Error koneksi");
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="text-blue-600" /> Buat Pesanan Baru
        </h2>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Nama Obat</th>
                <th className="p-4">Harga</th>
                <th className="p-4">Stok</th>
                <th className="p-4 w-32">Jumlah Pesan</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((item) => (
                <tr key={item.id}>
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4">Rp {item.price.toLocaleString()}</td>
                  <td className="p-4">{item.stock}</td>
                  <td className="p-4">
                    <input type="number" min="0" max={item.stock} className="border rounded p-2 w-20 text-center" placeholder="0" onChange={(e) => handleQtyChange(item.id, e.target.value)} value={cart[item.id] || ""} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 bg-gray-50 border-t flex justify-end">
            <button onClick={handleCheckout} className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2">
              <CheckCircle size={20} /> Checkout Pesanan
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderPage;
