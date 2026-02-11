import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Rooms from "./pages/Rooms";
import Chat from "./pages/Chat";

function requireAuth(element) {
  const user = localStorage.getItem("chat_user");
  return user ? element : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/rooms" element={requireAuth(<Rooms />)} />
      <Route path="/chat" element={requireAuth(<Chat />)} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
