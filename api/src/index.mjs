import app from "./app.mjs";
import { createServer } from "node:http";
import { Server } from "socket.io";
import registerRumbleSocket from "./socket.js";

const PORT = process.env.PORT || 3001;
const allowedOrigin = process.env.CLIENT_ORIGIN;

const server = createServer(app);
const io = new Server(server, {
  // Restrict Socket.IO to the frontend origin when one is configured.
  cors: allowedOrigin
    ? { origin: allowedOrigin, credentials: true }
    : { origin: false },
});

registerRumbleSocket(io);
app.set("io", io);

server.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
  console.log(`Socket.IO is ready on port ${PORT}`);
});
