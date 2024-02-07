const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");
const PORT = process.env.PORT || 3010;
const { instrument } = require("@socket.io/admin-ui");
const notifyAdmin = require("./middlewares/notify-admin");
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    cors,
    origin: [
      "https://admin.socket.io",
      "https://sockets-48f4f0779b20.herokuapp.com",
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`user connected`);

  socket.on("join-room", (room, username, callback) => {
    const notify_admin = process.env.NOTIFY_ADMIN;

    if (notify_admin === "true") notifyAdmin(username);

    console.log(`user ${username} just joined the room: ${room}`);
    socket.join(room);
    socket.to(room).emit("joined", username);
  });

  socket.on("message", (message, room) => {
    console.log("message:", message);

    if (room === "") {
      socket.broadcast.emit("receive-message", message);
    } else {
      socket.to(room).emit("receive-message", message);
    }
  });

  socket.on("disconnect", () => {
    console.log("disconnecting from socket");
  });

  socket.on("leave-room", (room, username) => {
    socket.to(room).emit("disconnected", username);
  });

  socket.on("isTyping", (username) => {
    console.log(`${username} is typing`);
  });

  socket.on("isNotTyping", (username) => {
    console.log(`${username} stop typing`);
  });


});

app.get("/", (req, res) => {
  res.redirect("https://admin.socket.io/#/");
});

instrument(io, {
  auth: {
    type: "basic",
    username: process.env.INSTRUMENT_USERNAME,
    password: process.env.INSTRUMENT_PASSWORD,
  },
  mode: "development",
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
