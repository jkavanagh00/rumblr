import http from "http";
import { Server } from "socket.io";
import app from "./app.mjs";
import registerChatSocket from "./socket.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);
registerChatSocket(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
