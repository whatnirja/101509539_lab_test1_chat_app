import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../config";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");

  useEffect(() => {
    if (localStorage.getItem("chat_user")) nav("/rooms");
  }, [nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username.trim(), password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) return setErr(data.message || "Login failed");

      localStorage.setItem("chat_user", JSON.stringify(data.user));
      nav("/rooms");
    } catch {
      setErr("Network error");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow rounded-xl overflow-hidden">
        <div className="bg-slate-800 text-white px-6 py-4 text-xl font-semibold">Chat App - Login</div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <Input label="Username" value={form.username} onChange={(v)=>setForm({...form, username:v})} />
          <Input label="Password" type="password" value={form.password} onChange={(v)=>setForm({...form, password:v})} />

          {err && <div className="text-red-600 text-sm">{err}</div>}

          <button className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg">
            Login
          </button>

          <div className="text-sm text-center">
            New here? <Link className="text-slate-800 underline" to="/signup">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, type="text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
    </div>
  );
}
