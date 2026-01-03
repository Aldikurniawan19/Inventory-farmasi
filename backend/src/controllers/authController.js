const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const JWT_SECRET = "rahasia_negara_api"; // Nanti bisa dipindah ke .env

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Cari user di database
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: "Username tidak ditemukan" });
    }

    // 2. Cek Password (Decode hash)
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Password salah" });
    }

    // 3. Generate Token (Tiket Masuk)
    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "1d" } // Token berlaku 1 hari
    );

    res.json({
      message: "Login Berhasil",
      token,
      user: {
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
