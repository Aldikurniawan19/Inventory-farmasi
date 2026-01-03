const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Fungsi Menambah Stok (Restock)
exports.restockProduct = async (req, res) => {
  try {
    const { productId, qty } = req.body;

    // Validasi input
    if (!productId || !qty || qty <= 0) {
      return res.status(400).json({ message: "Data tidak valid. Pastikan memilih obat dan jumlah > 0" });
    }

    // Update Database: Tambah stok lama dengan jumlah baru (increment)
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: {
        stock: {
          increment: parseInt(qty), // Fitur ajaib Prisma: otomatis nambah
        },
      },
    });

    res.json({
      message: "Stok berhasil ditambahkan!",
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal update stok" });
  }
};
