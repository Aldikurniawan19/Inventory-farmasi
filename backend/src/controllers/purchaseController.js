const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { recordLog } = require("./logController");

// 1. Ambil Data Supplier
exports.getSuppliers = async (req, res) => {
  const suppliers = await prisma.supplier.findMany();
  res.json(suppliers);
};

// 2. Buat Purchase Order Baru (Status: PENDING)
exports.createPO = async (req, res) => {
  try {
    const { supplierId, items } = req.body; // items = [{ productId, qty, costPrice }]
    const userId = req.user.userId;

    let totalAmount = 0;
    const poItemsData = items.map((item) => {
      const subtotal = item.qty * item.costPrice;
      totalAmount += subtotal;
      return {
        productId: parseInt(item.productId),
        qty: parseInt(item.qty),
        costPrice: parseFloat(item.costPrice),
      };
    });

    const newPO = await prisma.purchaseOrder.create({
      data: {
        supplierId: parseInt(supplierId),
        userId: userId,
        status: "PENDING",
        totalAmount: totalAmount,
        items: { create: poItemsData },
      },
    });

    res.json({ message: "PO Berhasil dibuat", data: newPO });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal membuat PO" });
  }
};

// 3. TERIMA BARANG (Penting: Ini pengganti 'Input Stok Manual')
// Saat PO diterima, stok obat otomatis bertambah sesuai DFD arus 2.0 -> 3.0
// backend/src/controllers/purchaseController.js

exports.receivePO = async (req, res) => {
  const { poId } = req.params;

  try {
    // 1. Jalankan Transaksi DATABASE (Hanya untuk Data Penting)
    await prisma.$transaction(async (tx) => {
      // Ambil Data PO
      const po = await tx.purchaseOrder.findUnique({
        where: { id: parseInt(poId) },
        include: { items: true },
      });

      if (!po) throw new Error("PO tidak ditemukan.");
      if (po.status === "RECEIVED") throw new Error("PO ini sudah diterima sebelumnya.");

      // Loop update stok
      for (const item of po.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.qty } },
        });
      }

      // Update Status PO
      await tx.purchaseOrder.update({
        where: { id: parseInt(poId) },
        data: { status: "RECEIVED" },
      });
    });
    // <--- TRANSAKSI SELESAI & DI-COMMIT DI SINI

    // 2. CATAT LOG DI LUAR TRANSAKSI (Agar lebih cepat)
    // Kode ini hanya akan jalan jika transaksi di atas sukses (tidak error)
    await recordLog(req.user.userId, "RESTOCK", `Menerima barang dari PO #${poId}`);

    // 3. Kirim Respon Sukses
    res.json({ message: "Barang diterima! Stok gudang telah diperbarui." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || "Gagal memproses penerimaan barang" });
  }
};

// 4. List PO (Untuk Dashboard Purchasing)
exports.getListPO = async (req, res) => {
  const pos = await prisma.purchaseOrder.findMany({
    include: { supplier: true, items: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(pos);
};
