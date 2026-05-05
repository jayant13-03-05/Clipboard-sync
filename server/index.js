const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

// ✅ Health route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("send-text", ({ roomId, text }) => {
    socket.to(roomId).emit("receive-text", text);
  });

  socket.on("send-image", ({ roomId, image }) => {
    if (!image) return;

    const sizeInBytes = (image.length * 3) / 4;

    if (sizeInBytes > 1024 * 1024) {
      console.log("Image too large");
      return;
    }

    socket.to(roomId).emit("receive-image", image);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// ✅ IMPORTANT
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});