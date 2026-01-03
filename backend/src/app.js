const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
// IMPORT CONTROLLER
const authController = require("./controllers/authController");
const productController = require("./controllers/productController");
const orderController = require("./controllers/orderController");
const { verifyToken } = require("./middleware/authMiddleware"); // Kita butuh middleware ini
const reportController = require("./controllers/reportController");
const purchaseController = require("./controllers/purchaseController");

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // Penting: agar bisa baca JSON dari frontend

// --- ROUTES ---

// 1. Route Login
app.post("/api/login", authController.login);
// Route Update Stok
app.post("/api/products/restock", productController.restockProduct);

app.post("/api/orders", verifyToken, orderController.createOrder);

// 2. Route Produk (Yang sudah ada)
app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Gagal ambil data" });
  }
});

// Route Ambil Daftar Pesanan Masuk (Untuk Gudang)
app.get("/api/orders/incoming", verifyToken, orderController.getIncomingOrders);
// Route Laporan Dashboard
app.get("/api/reports", verifyToken, reportController.getDashboardStats);
// Route Proses Kirim (Potong Stok)
app.post("/api/orders/:orderId/ship", verifyToken, orderController.shipOrder);

app.get("/api/suppliers", verifyToken, purchaseController.getSuppliers);
app.get("/api/purchase-orders", verifyToken, purchaseController.getListPO);
app.post("/api/purchase-orders", verifyToken, purchaseController.createPO);
app.post("/api/purchase-orders/:poId/receive", verifyToken, purchaseController.receivePO);
app.listen(PORT, () => {
  console.log(`🚀 Server Backend berjalan di http://localhost:${PORT}`);
});
