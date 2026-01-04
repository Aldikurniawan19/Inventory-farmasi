const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const PDFDocument = require("pdfkit-table");

// Helper 1: Format Rupiah
const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(number);
};

// Helper 2: Fungsi Menambahkan Tanda Tangan (Posisi Kanan Bawah)
const addSignature = (doc, adminName) => {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Cek posisi Y saat ini, jika terlalu bawah, buat halaman baru
  if (doc.y > 650) {
    doc.addPage();
  }

  // Beri jarak dari tabel
  doc.moveDown(3);

  // Simpan posisi Y awal blok tanda tangan
  const startY = doc.y;

  // Posisi X = 400 (agak ke kanan)
  doc.fontSize(10).font("Helvetica");
  doc.text(`Jakarta, ${currentDate}`, 350, startY, { align: "center", width: 200 });
  doc.text("Dicetak Oleh / Penanggung Jawab,", 350, startY + 15, { align: "center", width: 200 });

  // Space untuk tanda tangan
  doc.moveDown(4);

  // Nama Admin
  doc.font("Helvetica-Bold").text(`(  ${adminName}  )`, 350, doc.y, { align: "center", width: 200 });
  doc.font("Helvetica").text("Staff Gudang / Admin", 350, doc.y + 5, { align: "center", width: 200 });
};

// --- 1. DASHBOARD STATS ---
exports.getDashboardStats = async (req, res) => {
  try {
    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ["SHIPPED", "COMPLETED"] } },
    });

    const totalOrders = await prisma.order.count();
    const totalSKU = await prisma.product.count();
    const totalStock = await prisma.product.aggregate({ _sum: { stock: true } });

    const topProducts = await prisma.product.findMany({
      orderBy: { stock: "desc" },
      take: 5,
      select: { name: true, stock: true },
    });

    const statusGroup = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const pieData = statusGroup.map((g) => ({
      name: g.status,
      value: g._count.status,
    }));

    res.json({
      revenue: totalRevenue._sum.totalAmount || 0,
      orders: totalOrders,
      sku: totalSKU,
      stock: totalStock._sum.stock || 0,
      topProducts,
      pieData,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal ambil statistik" });
  }
};

// --- 2. LAPORAN PENGIRIMAN (PDF) ---
exports.getShippingReport = async (req, res) => {
  try {
    // Ambil User Admin yang request
    const admin = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const adminName = admin ? admin.name : "Admin";

    const orders = await prisma.order.findMany({
      where: { status: { in: ["SHIPPED", "COMPLETED"] } },
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Laporan_Pengiriman.pdf");
    doc.pipe(res);

    // Judul
    doc.fontSize(18).text("Laporan Pengiriman Barang", { align: "center" });
    doc.fontSize(10).text("PharmaDist Corp.", { align: "center" });
    doc.moveDown(2);

    const table = {
      title: "Riwayat Transaksi Keluar (Sales)",
      headers: ["ID", "Tanggal", "Penerima", "Status", "Item", "Total Nilai"],
      rows: orders.map((o) => [`#${o.id}`, new Date(o.createdAt).toLocaleDateString("id-ID"), o.user.name, o.status, o.items.reduce((acc, i) => acc + i.qty, 0).toString(), formatRupiah(o.totalAmount)]),
    };

    await doc.table(table, { width: 530 });

    // Tambahkan Tanda Tangan
    addSignature(doc, adminName);

    doc.end();
  } catch (error) {
    res.status(500).send("Gagal generate PDF");
  }
};

// --- 3. LAPORAN PEMBELIAN (PDF) ---
exports.getPurchasingReport = async (req, res) => {
  try {
    // Ambil User Admin
    const admin = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const adminName = admin ? admin.name : "Admin";

    const pos = await prisma.purchaseOrder.findMany({
      include: { supplier: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Laporan_Pembelian.pdf");
    doc.pipe(res);

    doc.fontSize(18).text("Laporan Pembelian (Procurement)", { align: "center" });
    doc.fontSize(10).text("PharmaDist Corp.", { align: "center" });
    doc.moveDown(2);

    const table = {
      title: "Riwayat Purchase Order (Inbound)",
      headers: ["PO ID", "Tanggal", "Supplier", "Status", "Item Utama", "Total"],
      rows: pos.map((p) => [`PO-${String(p.id).padStart(4, "0")}`, new Date(p.createdAt).toLocaleDateString("id-ID"), p.supplier.name, p.status, p.items.length > 0 ? p.items[0].product?.name : "-", formatRupiah(p.totalAmount)]),
    };

    await doc.table(table, { width: 530 });

    // Tambahkan Tanda Tangan
    addSignature(doc, adminName);

    doc.end();
  } catch (error) {
    res.status(500).send("Gagal generate PDF");
  }
};

// --- 4. LAPORAN STOK (PDF) ---
exports.getStockReport = async (req, res) => {
  try {
    // Ambil User Admin
    const admin = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const adminName = admin ? admin.name : "Admin";

    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Laporan_Stok.pdf");
    doc.pipe(res);

    doc.fontSize(18).text("Laporan Stok Obat (Inventory)", { align: "center" });
    doc.fontSize(10).text("PharmaDist Corp.", { align: "center" });
    doc.moveDown(2);

    const table = {
      title: "Posisi Stok Terkini",
      headers: ["Kode", "Nama Obat", "Kategori", "Stok", "Satuan", "Nilai Jual"],
      rows: products.map((p) => [`OB-${String(p.id).padStart(4, "0")}`, p.name, p.type, p.stock.toString(), p.unit, formatRupiah(p.price)]),
    };

    await doc.table(table, {
      width: 530,
      columnsSize: [60, 150, 80, 50, 60, 100],
    });

    // Tambahkan Tanda Tangan
    addSignature(doc, adminName);

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Gagal generate PDF");
  }
};
