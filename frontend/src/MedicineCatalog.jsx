import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { ShoppingCart, Plus, Minus, Search, Package } from "lucide-react";
import Swal from "sweetalert2";

const MedicineCatalog = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  // Manajemen Keranjang
  const updateCart = (productId, delta) => {
    setCart((prev) => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const handleCheckout = async () => {
    const items = Object.entries(cart).map(([id, qty]) => ({ productId: parseInt(id), qty }));
    if (items.length === 0) return Swal.fire("Keranjang Kosong", "Pilih obat dulu!", "warning");

    const result = await Swal.fire({
      title: "Konfirmasi Pesanan",
      text: `Anda akan memesan ${items.length} jenis obat.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Pesan Sekarang",
      confirmButtonColor: "#3B82F6",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ items }),
        });

        if (res.ok) {
          Swal.fire("Berhasil!", "Pesanan dikirim ke Gudang.", "success");
          setCart({}); // Kosongkan keranjang
        } else {
          Swal.fire("Gagal", "Stok gudang mungkin tidak cukup", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Gagal koneksi server", "error");
      }
    }
  };

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalItemsInCart = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header & Cart Info */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-10">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari obat..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={handleCheckout}
            disabled={totalItemsInCart === 0}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition shadow-lg ${totalItemsInCart > 0 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            <ShoppingCart size={20} /> Checkout ({totalItemsInCart})
          </button>
        </div>

        {/* Grid Obat */}
        {loading ? (
          <div className="text-center py-10">Memuat katalog...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Package size={24} />
                  </div>
                  <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">Stok: {product.stock}</span>
                </div>

                <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{product.type}</p>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="font-bold text-blue-600">Rp {product.price.toLocaleString()}</span>

                  {/* Kontrol Jumlah */}
                  <div className="flex items-center gap-3">
                    {cart[product.id] > 0 ? (
                      <>
                        <button onClick={() => updateCart(product.id, -1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200 text-gray-600">
                          <Minus size={16} />
                        </button>
                        <span className="font-bold w-4 text-center">{cart[product.id]}</span>
                        <button onClick={() => updateCart(product.id, 1)} className="p-1 bg-blue-100 rounded hover:bg-blue-200 text-blue-600" disabled={product.stock <= cart[product.id]}>
                          <Plus size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => updateCart(product.id, 1)}
                        disabled={product.stock === 0}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        + Pesan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MedicineCatalog;
