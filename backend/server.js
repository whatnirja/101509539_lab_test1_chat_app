const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");

const User = require("./models/User");
const GroupMessage = require("./models/GroupMessage");
const PrivateMessage = require("./models/PrivateMessage");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use("/view", express.static("view"));

app.use("/api", authRoutes);
app.use("/api", messageRoutes);

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/chat_app";
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const ROOMS = ["devops", "cloud computing", "covid19", "sports", "nodeJS", "news"];

const onlineUsers = new Map();

function getUsersInRoom(room) {
  const members = [];
  for (const [username, info] of onlineUsers.entries()) {
    if (info.room === room) members.push(username);
  }
  return members.sort();
}

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("joinRoom", async ({ username, room }) => {
    if (!username || !room) return;

    const prev = onlineUsers.get(username);
    if (prev?.room) socket.leave(prev.room);

    onlineUsers.set(username, { socketId: socket.id, room });
    socket.join(room);

    io.to(room).emit("roomMembers", {
      room,
      members: getUsersInRoom(room),
    });

    const history = await GroupMessage.find({ room })
      .sort({ date_sent: -1 })
      .limit(50)
      .lean();

    socket.emit("groupHistory", history.reverse());

    io.to(room).emit("groupMessage", {
      from_user: "Chat App",
      room,
      message: `${username} has joined the chat`,
      date_sent: new Date(),
      isSystem: true,
    });
  });

  socket.on("leaveRoom", ({ username }) => {
    const info = onlineUsers.get(username);
    if (!info?.room) return;

    const room = info.room;
    socket.leave(room);
    onlineUsers.set(username, { socketId: socket.id, room: null });

    io.to(room).emit("roomMembers", {
      room,
      members: getUsersInRoom(room),
    });

    io.to(room).emit("groupMessage", {
      from_user: "Chat App",
      room,
      message: `${username} has left the chat`,
      date_sent: new Date(),
      isSystem: true,
    });
  });

  socket.on("sendGroupMessage", async ({ from_user, room, message }) => {
    console.log("sendGroupMessage received:", from_user, room, message);
    if (!from_user || !room || !message?.trim()) return;

    const msgDoc = await GroupMessage.create({
      from_user,
      room,
      message: message.trim(),
      date_sent: new Date(),
    });

    console.log("Emitting groupMessage to room:", room, "with message:", msgDoc);

    io.to(room).emit("groupMessage", msgDoc);
  });


  socket.on("privateTyping", ({ from_user, to_user, isTyping }) => {
    const toInfo = onlineUsers.get(to_user);
    if (!toInfo?.socketId) return;

    io.to(toInfo.socketId).emit("privateTyping", {
      from_user,
      isTyping: !!isTyping,
    });
  });

  socket.on("sendPrivateMessage", async ({ from_user, to_user, message }) => {
    console.log("sendPrivateMessage received:", from_user, to_user, message);
    if (!from_user || !to_user || !message?.trim()) return;

    const msgDoc = await PrivateMessage.create({
      from_user,
      to_user,
      message: message.trim(),
      date_sent: new Date(),
    });

    console.log("Emitting privateMessage to users:", from_user, to_user, "with message:", msgDoc);

    const toInfo = onlineUsers.get(to_user);
    const fromInfo = onlineUsers.get(from_user);

    if (fromInfo?.socketId) io.to(fromInfo.socketId).emit("privateMessage", msgDoc);
    if (toInfo?.socketId) io.to(toInfo.socketId).emit("privateMessage", msgDoc);
  });

  socket.on("disconnect", () => {
    for (const [username, info] of onlineUsers.entries()) {
      if (info.socketId === socket.id) {
        const room = info.room;
        onlineUsers.delete(username);

        if (room) {
          io.to(room).emit("roomMembers", {
            room,
            members: getUsersInRoom(room),
          });

          io.to(room).emit("groupMessage", {
            from_user: "Chat App",
            room,
            message: `${username} has disconnected`,
            date_sent: new Date(),
            isSystem: true,
          });
        }
        break;
      }
    }
    console.log("socket disconnected:", socket.id);
  });
});

app.get("/api/rooms", (req, res) => res.json(ROOMS));

app.get("/", (req, res) => {
  res.redirect("/view/login.html");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
