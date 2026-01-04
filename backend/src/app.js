const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

// IMPORT CONTROLLER
const authController = require("./controllers/authController");
const productController = require("./controllers/productController");
const orderController = require("./controllers/orderController");
const purchaseController = require("./controllers/purchaseController");
const logController = require("./controllers/logController");
const reportController = require("./controllers/reportController"); // Import Controller

const { verifyToken } = require("./middleware/authMiddleware");

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. Auth & Produk
app.post("/api/login", authController.login);
app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Gagal ambil data" });
  }
});
app.post("/api/products", productController.createProduct);
app.post("/api/products/restock", productController.restockProduct);

// 2. Orders
app.post("/api/orders", verifyToken, orderController.createOrder);
app.get("/api/orders/shipped", verifyToken, orderController.getShippedOrders);
app.get("/api/orders/incoming", verifyToken, orderController.getIncomingOrders);
app.post("/api/orders/:orderId/ship", verifyToken, orderController.shipOrder);
app.get("/api/orders/my", verifyToken, orderController.getMyOrders);
app.post("/api/orders/:orderId/complete", verifyToken, orderController.completeOrder);

// 3. Purchasing (PO)
app.get("/api/suppliers", verifyToken, purchaseController.getSuppliers);
app.get("/api/purchase-orders", verifyToken, purchaseController.getListPO);
app.post("/api/purchase-orders", verifyToken, purchaseController.createPO);
app.post("/api/purchase-orders/:poId/receive", verifyToken, purchaseController.receivePO);

// 4. Logs & Reports
app.get("/api/logs", verifyToken, logController.getRecentLogs);

// === PERHATIKAN BAGIAN INI ===
// Route Utama Laporan (Card & Chart Statistik Gabungan)
app.get("/api/reports", verifyToken, reportController.getDashboardStats);

// Route Download PDF
app.get("/api/reports/shipping", verifyToken, reportController.getShippingReport);
app.get("/api/reports/purchasing", verifyToken, reportController.getPurchasingReport);
app.get("/api/reports/stock", verifyToken, reportController.getStockReport);

// ... route laporan lainnya ...
app.get("/api/reports/stock", verifyToken, reportController.getStockReport);

// TAMBAHKAN INI:
app.get("/api/reports/backup", verifyToken, reportController.backupDatabase);

// HAPUS BARIS INI JIKA MASIH ADA DI KODE ANDA:
// app.get("/api/reports/chart", verifyToken, reportController.getChartData);
// (Fungsi getChartData sudah tidak ada di controller baru, ini penyebab errornya)

app.listen(PORT, () => {
  console.log(`🚀 Server Backend berjalan di http://localhost:${PORT}`);
});
