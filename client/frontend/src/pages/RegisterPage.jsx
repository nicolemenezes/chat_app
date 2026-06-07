import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#313338] flex items-center justify-center p-4">
      <div className="bg-[#2b2d31] rounded-xl p-8 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-semibold text-white text-center mb-1">Create an account</h1>
        <p className="text-[#b5bac1] text-sm text-center mb-6">Join Connectico today</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {[
            { name: "username", label: "Username", type: "text", placeholder: "Choose a username" },
            { name: "email", label: "Email", type: "email", placeholder: "Enter your email" },
            { name: "password", label: "Password", type: "password", placeholder: "Create a password" },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-semibold text-[#b5bac1] uppercase tracking-wide mb-1.5">
                {label}
              </label>
              <input
                name={name} type={type} value={form[name]} onChange={handle} required
                className="w-full bg-[#1e1f22] text-white rounded-lg px-3 py-2.5 text-sm outline-none
                           border border-transparent focus:border-[#5865f2] transition-colors"
                placeholder={placeholder}
              />
            </div>
          ))}
          <button
            type="submit" disabled={loading}
            className="w-full bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white
                       font-medium py-2.5 rounded-lg text-sm transition-colors mt-2"
          >
            {loading ? "Creating account..." : "Continue"}
          </button>
        </form>

        <p className="text-[#80848e] text-sm mt-5 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[#5865f2] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}