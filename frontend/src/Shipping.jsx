import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { Truck, Printer, MapPin, Package } from "lucide-react";

const Shipping = () => {
  const [shippedOrders, setShippedOrders] = useState([]);

  // Ambil data status SHIPPED
  useEffect(() => {
    fetch("http://localhost:5000/api/orders/shipped", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setShippedOrders(data);
        } else {
          setShippedOrders([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setShippedOrders([]);
      });
  }, []);

  // --- FUNGSI CETAK SURAT JALAN ---
  const handlePrint = (order) => {
    // 1. Buat Jendela Baru
    const printWindow = window.open("", "", "height=600,width=800");

    // 2. Desain HTML Surat Jalan
    const htmlContent = `
      <html>
        <head>
          <title>Surat Jalan - #${order.id}</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 20px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .company-info h1 { margin: 0; font-size: 24px; color: #1a2332; }
            .company-info p { margin: 5px 0; font-size: 14px; color: #666; }
            .doc-title { text-align: right; }
            .doc-title h2 { margin: 0; font-size: 28px; color: #333; text-transform: uppercase; letter-spacing: 2px; }
            .doc-title p { margin: 5px 0; font-size: 14px; font-weight: bold; }
            
            .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .box { width: 45%; }
            .box h3 { font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase; color: #666; }
            .box p { margin: 5px 0; font-size: 14px; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f3f4f6; text-align: left; padding: 12px; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            .qty-col { text-align: center; font-weight: bold; }
            
            .footer { display: flex; justify-content: space-between; margin-top: 50px; }
            .sign-box { text-align: center; width: 200px; }
            .sign-space { height: 80px; border-bottom: 1px solid #333; margin-bottom: 10px; }
            .note { font-size: 12px; color: #666; margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 10px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <h1>PharmaDist Corp.</h1>
              <p>Jl. Industri Farmasi No. 123, Jakarta Selatan</p>
              <p>Telp: (021) 555-0199 | Email: admin@pharmadist.com</p>
            </div>
            <div class="doc-title">
              <h2>Surat Jalan</h2>
              <p>NO: SJ-${new Date().getFullYear()}/${String(order.id).padStart(4, "0")}</p>
              <p>TANGGAL: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="box">
              <h3>Penerima (Kepada)</h3>
              <p><strong>${order.user.name}</strong></p>
              <p>Jl. Raya Apotek Sehat No. 88</p>
              <p>Jakarta Barat, Indonesia</p>
              <p>Telp: 0812-3456-7890</p>
            </div>
            <div class="box">
              <h3>Informasi Pengiriman</h3>
              <p>No. Order Asal: #ORD-${order.id}</p>
              <p>Ekspedisi: Kurir Internal</p>
              <p>Status: <span style="font-weight:bold">DIKIRIM</span></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th width="5%">No</th>
                <th width="15%">Kode SKU</th>
                <th width="50%">Nama Barang</th>
                <th width="15%">Satuan</th>
                <th width="15%" class="qty-col">Jumlah Kirim</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>OB-${String(item.product.id).padStart(4, "0")}</td>
                  <td>${item.product.name}</td>
                  <td>${item.product.unit}</td>
                  <td class="qty-col">${item.qty}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <div class="sign-box">
              <p>Penerima Barang</p>
              <div class="sign-space"></div>
              <p>( ${order.user.name} )</p>
            </div>
            <div class="sign-box">
              <p>Hormat Kami,</p>
              <div class="sign-space"></div>
              <p>( Bagian Logistik )</p>
            </div>
          </div>

          <div class="note">
            * Barang yang sudah diterima wajib dicek. Komplain maksimal 1x24 jam setelah barang diterima.<br>
            * Dokumen ini sah dan dicetak otomatis oleh sistem PharmaDist.
          </div>

          <script>
            window.print();
            // window.close(); // Opsional: Tutup otomatis setelah print
          </script>
        </body>
      </html>
    `;

    // 3. Tulis Konten ke Jendela Baru
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="text-green-600" /> Data Pengiriman
          </h2>
          <p className="text-gray-500">Riwayat barang yang sedang dalam perjalanan ke pelanggan.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
              <tr>
                <th className="p-4">ID Pengiriman</th>
                <th className="p-4">Tujuan (Apotek)</th>
                <th className="p-4">Total Item</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {shippedOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    Belum ada pengiriman.
                  </td>
                </tr>
              ) : (
                shippedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">#SHP-{order.id}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700">{order.user.name}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin size={10} /> Lokasi Apotek
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Package size={14} /> {order.items.length} Jenis Barang
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">DIKIRIM</span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handlePrint(order)} // <--- PANGGIL FUNGSI PRINT DI SINI
                        className="text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 mx-auto bg-white"
                      >
                        <Printer size={14} /> Surat Jalan
                      </button>
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

export default Shipping;
