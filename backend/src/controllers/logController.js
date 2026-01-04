const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 1. Fungsi Helper untuk Mencatat Log (Dipanggil dari controller lain)
exports.recordLog = async (userId, action, details) => {
  try {
    await prisma.activityLog.create({
      data: { userId, action, details },
    });
  } catch (error) {
    console.error("Gagal mencatat log:", error);
  }
};

// 2. API Ambil Data Log (Untuk Dashboard)
exports.getRecentLogs = async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      take: 10, // Ambil 10 terakhir
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, role: true } } },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Gagal ambil log" });
  }
};
