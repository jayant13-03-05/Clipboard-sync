const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // 🔥 Join Room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`📦 ${socket.id} joined room: ${roomId}`);
  });

  // 🔥 TEXT SEND
  socket.on("send-text", ({ roomId, text }) => {
    socket.to(roomId).emit("receive-text", text);
  });

  // 🔥 IMAGE SEND (≤1MB check)
  socket.on("send-image", ({ roomId, image }) => {
    if (!image) return;

    // Approx size check (base64 string length)
    const sizeInBytes = (image.length * 3) / 4;

    if (sizeInBytes > 1024 * 1024) {
      console.log("❌ Image too large (>1MB)");
      return;
    }

    socket.to(roomId).emit("receive-image", image);
  });

  // 🔴 Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// 🔥 Start Server
server.listen(3001, "0.0.0.0", () => {
  console.log("🚀 Server running on port 3001");
});