import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, User, Hexagon } from "lucide-react"; 

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setError(data.message);
        setIsLoading(false);
      }
    } catch (err) {
      setError("Gagal menghubungi server");
      setIsLoading(false);
    }
  };

  return (
    // BACKGROUND GRADIENT MODERN
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
      {/* Dekorasi Latar Belakang (Bulatan Blur) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg mb-4">
            <Hexagon className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">PharmaDist</h2>
          <p className="text-indigo-200 text-sm mt-1">Sistem Distribusi Farmasi Terpadu</p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm mb-6 text-center backdrop-blur-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-indigo-200 uppercase mb-2 tracking-wider">Username</label>
            <div className="relative group">
              <User className="absolute left-3 top-3 text-indigo-300 group-focus-within:text-white transition-colors" size={18} />
              <input
                type="text"
                className="w-full pl-10 p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 transition-all"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-indigo-200 uppercase mb-2 tracking-wider">Password</label>
            <div className="relative group">
              <KeyRound className="absolute left-3 top-3 text-indigo-300 group-focus-within:text-white transition-colors" size={18} />
              <input
                type="password"
                className="w-full pl-10 p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 transition-all"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex justify-center items-center ${
              isLoading ? "bg-indigo-600/50 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/30"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Memverifikasi...
              </span>
            ) : (
              "Masuk ke Sistem"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-indigo-300/60">&copy; 2025 PharmaDist Corp. Secure Access.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
