import app from "./app.mjs";
import { createServer } from "node:http";
import { Server } from "socket.io";
import registerRumbleSocket from "./socket.js";

const PORT = process.env.PORT || 3001;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

registerRumbleSocket(io);
app.set("io", io);

server.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
  console.log(`Socket.IO is ready on port ${PORT}`);
});
