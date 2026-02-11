import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE } from "../config";

export default function Chat() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("chat_user") || "null");
  const room = localStorage.getItem("chat_room");

  const socket = useMemo(() => io(API_BASE), []);
  const chatEndRef = useRef(null);

  const [members, setMembers] = useState([]);
  const [mode, setMode] = useState("room"); 
  const [toUser, setToUser] = useState("");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState("");

  useEffect(() => {
    if (!user) return nav("/login");
    if (!room) return nav("/rooms");

    socket.emit("joinRoom", { username: user.username, room });

    socket.on("roomMembers", ({ members }) => setMembers(members));
    socket.on("groupHistory", (history) => setMessages(history));
    socket.on("groupMessage", (m) => setMessages((prev) => [...prev, m]));

    socket.on("privateMessage", (m) => {
      if (mode !== "private") return;
      const other = toUser;
      const match =
        (m.from_user === user.username && m.to_user === other) ||
        (m.from_user === other && m.to_user === user.username);
      if (match) setMessages((prev) => [...prev, m]);
    });

    socket.on("privateTyping", ({ from_user, isTyping }) => {
      if (mode !== "private") return;
      if (from_user !== toUser) return;
      setTyping(isTyping ? `${from_user} is typing...` : "");
    });

    return () => {
      socket.disconnect();
    };
  }, [API_BASE, mode, nav, room, socket, toUser, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadUsers() {
    const res = await fetch(`${API_BASE}/api/users`);
    const data = await res.json();
    const list = data.map(u => u.username).filter(u => u !== user.username);
    setUsers(list);
    if (!toUser && list.length) setToUser(list[0]);
  }

  async function loadPrivateHistory(other) {
    const res = await fetch(`${API_BASE}/api/private?a=${encodeURIComponent(user.username)}&b=${encodeURIComponent(other)}`);
    const data = await res.json();
    setMessages(data);
  }

  useEffect(() => {
    (async () => {
      if (mode === "private") {
        await loadUsers();
      } else {
        setTyping("");
        socket.emit("joinRoom", { username: user.username, room }); 
      }
    })();
  }, [mode]);

  useEffect(() => {
    if (mode === "private" && toUser) loadPrivateHistory(toUser);
  }, [toUser]);

  function leaveRoom() {
    socket.emit("leaveRoom", { username: user.username });
    localStorage.removeItem("chat_room");
    nav("/rooms");
  }

  function logout() {
    socket.emit("leaveRoom", { username: user.username });
    localStorage.removeItem("chat_user");
    localStorage.removeItem("chat_room");
    nav("/login");
  }

  function send() {
    const msg = text.trim();
    if (!msg) return;

    if (mode === "room") {
      socket.emit("sendGroupMessage", { from_user: user.username, room, message: msg });
    } else {
      if (!toUser) return;
      socket.emit("sendPrivateMessage", { from_user: user.username, to_user: toUser, message: msg });
      socket.emit("privateTyping", { from_user: user.username, to_user: toUser, isTyping: false });
      setTyping("");
    }

    setText("");
  }

  useEffect(() => {
    if (mode !== "private" || !toUser) return;

    const t = setTimeout(() => {
      socket.emit("privateTyping", { from_user: user.username, to_user: toUser, isTyping: false });
    }, 800);

    return () => clearTimeout(t);
  }, [text]); 
  function onInput(v) {
    setText(v);
    if (mode === "private" && toUser) {
      socket.emit("privateTyping", { from_user: user.username, to_user: toUser, isTyping: true });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto bg-white shadow rounded-xl overflow-hidden">
        <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
          <div className="font-semibold text-xl">Chat app</div>
          <div className="flex gap-2">
            <button onClick={leaveRoom} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">Leave Room</button>
            <button onClick={logout} className="text-sm border border-white/40 hover:bg-white/10 px-3 py-1 rounded">Logout</button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-slate-100 border rounded-lg p-3">
              <div className="text-sm font-semibold text-slate-700">Room: <span className="font-normal">{room}</span></div>
              <div className="text-xs text-slate-600 mt-2 font-semibold">Members</div>
              <ul className="mt-1 text-sm text-slate-700 space-y-1">
                {members.map(m => <li key={m}>{m}</li>)}
              </ul>
            </div>

            <div className="bg-slate-100 border rounded-lg p-3 space-y-2">
              <div className="text-sm font-semibold text-slate-700">Message Mode</div>
              <select value={mode} onChange={(e)=>setMode(e.target.value)} className="w-full border rounded-lg px-2 py-2">
                <option value="room">Room (Group)</option>
                <option value="private">Private (1-to-1)</option>
              </select>

              {mode === "private" && (
                <>
                  <div className="text-sm font-medium text-slate-700">Send to</div>
                  <select
                    value={toUser}
                    onChange={(e)=>setToUser(e.target.value)}
                    className="w-full border rounded-lg px-2 py-2"
                  >
                    {users.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="h-[70vh] overflow-y-auto border rounded-lg bg-white p-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`mb-2 p-3 rounded-lg ${m.from_user === user.username ? "bg-blue-50" : "bg-slate-100"}`}
                >
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold">{m.from_user}</span>{" "}
                    • {new Date(m.date_sent).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
                  </div>
                  <div className="text-slate-900">{m.message}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="h-5 text-sm text-slate-500 mt-1">{typing}</div>

            <div className="flex gap-2 mt-2">
              <input
                value={text}
                onChange={(e)=>onInput(e.target.value)}
                onKeyDown={(e)=> e.key === "Enter" ? send() : null}
                className="flex-1 border rounded-lg px-3 py-2"
                placeholder="Type your message..."
              />
              <button onClick={send} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
