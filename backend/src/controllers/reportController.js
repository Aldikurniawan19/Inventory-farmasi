const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Hitung Total Produk & Total Stok
    const totalProducts = await prisma.product.count();
    const products = await prisma.product.findMany();
    const totalStock = products.reduce((acc, curr) => acc + curr.stock, 0);

    // 2. Hitung Total Pesanan & Pendapatan
    const totalOrders = await prisma.order.count();
    const orders = await prisma.order.findMany();
    const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // 3. Data Grafik Status Pesanan
    const processing = await prisma.order.count({ where: { status: "PROCESSING" } });
    const shipped = await prisma.order.count({ where: { status: "SHIPPED" } });
    const completed = await prisma.order.count({ where: { status: "COMPLETED" } });

    res.json({
      summary: {
        totalProducts,
        totalStock,
        totalOrders,
        totalRevenue,
      },
      orderStatus: [
        { name: "Diproses", value: processing },
        { name: "Dikirim", value: shipped },
        { name: "Selesai", value: completed },
      ],
      stockData: products.map((p) => ({ name: p.name, stock: p.stock })).slice(0, 5), // Ambil 5 produk saja untuk grafik
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memuat laporan" });
  }
};
