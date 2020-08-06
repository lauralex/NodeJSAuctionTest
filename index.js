const express = require("express");
//const socket = require("socket.io");

// App setup
const PORT = process.env.PORT || 5000;
const app = express();
const path = require('path');
const server = require('http').createServer(app);

server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
	console.log(`http://localhost:${PORT}`);
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Socket setup
const io = require('socket.io')(server);

const activeUsers = new Set();

let timeout = null;

let counter = 0;
const intervalFunc = () => {
  if (counter == 3 && timeout) {
    clearInterval(timeout);
    console.log("\x1b[33m\x61\x6c\x65\x78\x20\x62\x65\x6c\x6c\x3c\x53\x59\x53\x54\x45\x4d\x3e\x3a\x20STOP!");
    io.emit("chat message", {nick: "", message: "STOP!"});
    counter = 0;
    return;
  }
  io.emit("chat message", {nick: "", message: ++counter});
}

io.on("connection", function (socket) {
  console.log("\x1b[33m\x61\x6c\x65\x78\x20\x62\x65\x6c\x6c\x3c\x53\x59\x53\x54\x45\x4d\x3e\x3a\x20Made socket connection");

  

  socket.on("new user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    console.log(`\x1b[33m\x61\x6c\x65\x78\x20\x62\x65\x6c\x6c\x3c\x53\x59\x53\x54\x45\x4d\x3e\x3a\x20\x1b[32m${data}\x1b[0m` + ` connected!`);
    //console.log("\x1b[31m%s\x1b[0m", "yes");
    io.emit("new user", [...activeUsers]);
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    if (socket.userId) {
      console.log(`\x1b[33m\x61\x6c\x65\x78\x20\x62\x65\x6c\x6c\x3c\x53\x59\x53\x54\x45\x4d\x3e\x3a\x20\x1b[31m${socket.userId}\x1b[0m` + ` disconnected!`);
    }
    
    io.emit("user disconnected", socket.userId);
  });
  
  socket.on("chat message", function (data) {
    const time = new Date(Date.now() + 3600000 * 2);
    const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });
    //console.log({nick: data.nick, time: formattedTime});
    console.log(`\x1b[33m\x61\x6c\x65\x78\x20\x62\x65\x6c\x6c\x3c\x53\x59\x53\x54\x45\x4d\x3e\x3a\x20\x1b[0m{ nick: \x1b[32m'${data.nick}'\x1b[0m, time: \x1b[32m'${formattedTime}'\x1b[0m }`);
    io.emit("chat message", {nick: "NICKNAME: " + data.nick, message: data.message});
    if(timeout) clearInterval(timeout);
    counter = 0;
    timeout = setInterval(intervalFunc, 1000);
  });
  
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });
});