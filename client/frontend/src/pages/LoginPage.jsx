import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#313338] flex items-center justify-center p-4">
      <div className="bg-[#2b2d31] rounded-xl p-8 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-semibold text-white text-center mb-1">Welcome back!</h1>
        <p className="text-[#b5bac1] text-sm text-center mb-6">We're so excited to see you again!</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#b5bac1] uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              name="email" type="email" value={form.email} onChange={handle} required
              className="w-full bg-[#1e1f22] text-white rounded-lg px-3 py-2.5 text-sm outline-none
                         border border-transparent focus:border-[#5865f2] transition-colors"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#b5bac1] uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              name="password" type="password" value={form.password} onChange={handle} required
              className="w-full bg-[#1e1f22] text-white rounded-lg px-3 py-2.5 text-sm outline-none
                         border border-transparent focus:border-[#5865f2] transition-colors"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white
                       font-medium py-2.5 rounded-lg text-sm transition-colors mt-2"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-[#80848e] text-sm mt-5 text-center">
          Need an account?{" "}
          <Link to="/register" className="text-[#5865f2] hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}