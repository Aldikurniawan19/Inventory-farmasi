const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  // 1. Buat Password Hash (passwordnya: "123456")
  const passwordHash = await bcrypt.hash("123456", 10);

  // 2. Buat User: Manajer Gudang
  const gudang = await prisma.user.upsert({
    where: { username: "gudang" },
    update: {},
    create: {
      username: "gudang",
      password: passwordHash,
      name: "Budi Santoso",
      role: "GUDANG",
    },
  });

  // 3. Buat User: Apotek (Pelanggan)
  const apotek = await prisma.user.upsert({
    where: { username: "apotek" },
    update: {},
    create: {
      username: "apotek",
      password: passwordHash,
      name: "Apotek Sehat Jaya",
      role: "APOTEK",
    },
  });

  // 4. Buat Beberapa Produk Obat
  await prisma.product.createMany({
    data: [
      { name: "Paracetamol 500mg", type: "Obat Bebas", unit: "Strip", price: 5000, stock: 100, location: "Rak A-1" },
      { name: "Amoxicillin 500mg", type: "Obat Keras", unit: "Strip", price: 12000, stock: 50, location: "Rak B-2" },
      { name: "Vitamin C 1000mg", type: "Suplemen", unit: "Botol", price: 45000, stock: 20, location: "Rak C-1" },
    ],
  });

  // 5. Buat User: Staff Purchasing
  await prisma.user.upsert({
    where: { username: "purchasing" },
    update: {},
    create: {
      username: "purchasing",
      password: passwordHash, // Pakai hash yang sama (123456)
      name: "Siti Purchasing",
      role: "PURCHASING",
    },
  });

  // 6. Buat Data Supplier Dummy
  await prisma.supplier.createMany({
    data: [
      { name: "PT. Kimia Farma Trading", phone: "021-1234567", address: "Jakarta" },
      { name: "PT. Mensa Bina Sukses", phone: "022-9876543", address: "Bandung" },
    ],
  });

  console.log("✅ Database berhasil diisi data dummy!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
