import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function Rooms() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("chat_user") || "null");
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE}/api/rooms`);
      const data = await res.json();
      setRooms(data);
      setRoom(data?.[0] || "");
    })();
  }, []);

  function logout() {
    localStorage.removeItem("chat_user");
    localStorage.removeItem("chat_room");
    nav("/login");
  }

  function join() {
    if (!room) return;
    localStorage.setItem("chat_room", room);
    nav("/chat");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white shadow rounded-xl overflow-hidden">
        <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold">Chat App</div>
          <button onClick={logout} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">
            Logout
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input value={user?.username || ""} disabled className="w-full border rounded-lg px-3 py-2 bg-slate-100" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Room</label>
            <select
              value={room}
              onChange={(e)=>setRoom(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              {rooms.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <button onClick={join} className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg">
            Join Chat Room
          </button>
        </div>
      </div>
    </div>
  );
}
