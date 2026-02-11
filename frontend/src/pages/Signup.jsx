import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../config";

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", firstname: "", lastname: "", password: "" });
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    const payload = {
      username: form.username.trim(),
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      password: form.password,
    };

    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return setErr(data.message || "Signup failed");

      nav("/login");
    } catch {
      setErr("Network error");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow rounded-xl overflow-hidden">
        <div className="bg-slate-800 text-white px-6 py-4 text-xl font-semibold">Chat App - Signup</div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <Input label="Username" value={form.username} onChange={(v)=>setForm({...form, username:v})} />
          <Input label="First name" value={form.firstname} onChange={(v)=>setForm({...form, firstname:v})} />
          <Input label="Last name" value={form.lastname} onChange={(v)=>setForm({...form, lastname:v})} />
          <Input label="Password" type="password" value={form.password} onChange={(v)=>setForm({...form, password:v})} />

          {err && <div className="text-red-600 text-sm">{err}</div>}

          <button className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg">
            Create Account
          </button>

          <div className="text-sm text-center">
            Already have an account? <Link className="text-slate-800 underline" to="/login">Login</Link>
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
