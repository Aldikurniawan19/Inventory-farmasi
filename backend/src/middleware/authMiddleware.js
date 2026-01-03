const jwt = require("jsonwebtoken");
const JWT_SECRET = "rahasia_negara_api";

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Ambil "Bearer <token>"

  if (!token) return res.status(401).json({ message: "Akses ditolak" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });
    req.user = decoded;
    next();
  });
};
