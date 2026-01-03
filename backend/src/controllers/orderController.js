const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body; // items = [{ productId: 1, qty: 2 }, ...]
    const userId = req.user.userId; // Dari token login

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Keranjang belanja kosong" });
    }

    // 1. Hitung Total Harga & Siapkan Data Item
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: parseInt(item.productId) } });

      if (!product) continue;

      // Cek apakah stok cukup (Opsional, tapi bagus untuk validasi)
      if (product.stock < item.qty) {
        return res.status(400).json({ message: `Stok ${product.name} tidak cukup!` });
      }

      const subtotal = product.price * item.qty;
      totalAmount += subtotal;

      orderItemsData.push({
        productId: product.id,
        qty: parseInt(item.qty),
        price: product.price,
      });
    }

    // 2. Simpan Transaksi ke Database (Order + OrderItems)
    const newOrder = await prisma.order.create({
      data: {
        userId: userId,
        totalAmount: totalAmount,
        status: "PROCESSING", // Status awal
        items: {
          create: orderItemsData,
        },
      },
      include: { items: true }, // Sertakan detail item di respon
    });

    res.json({
      message: "Pesanan berhasil dibuat!",
      data: newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memproses pesanan" });
  }
};

// ... kode createOrder yang sudah ada di atas ...

// Fungsi Proses Kirim (Potong Stok)
exports.shipOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    // GUNAKAN TRANSAKSI (Agar aman)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil Data Pesanan
      const order = await tx.order.findUnique({
        where: { id: parseInt(orderId) },
        include: { items: true },
      });

      if (!order) throw new Error("Pesanan tidak ditemukan");
      if (order.status !== "PROCESSING") throw new Error("Pesanan sudah diproses sebelumnya");

      // 2. Loop setiap barang untuk potong stok
      for (const item of order.items) {
        // Cek stok fisik dulu
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product || product.stock < item.qty) {
          throw new Error(`Stok obat ${product?.name} tidak cukup! (Sisa: ${product?.stock})`);
        }

        // POTONG STOK (Decrement)
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        });
      }

      // 3. Ubah Status Pesanan jadi SHIPPED
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: "SHIPPED" },
      });

      return updatedOrder;
    });

    res.json({ message: "Pengiriman berhasil diproses & stok telah dikurangi.", data: result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || "Gagal memproses pengiriman" });
  }
};

// Tambahkan endpoint untuk melihat daftar pesanan masuk (Khusus Gudang)
exports.getIncomingOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: "PROCESSING" }, // Hanya yang belum diproses
      include: {
        user: { select: { name: true } }, // Ambil nama pemesan
        items: { include: { product: true } }, // Ambil detail obat
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Gagal ambil data pesanan" });
  }
};
