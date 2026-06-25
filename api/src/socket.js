export default function registerRumbleSocket(io) {
  io.on("connection", (socket) => {
    socket.on("rumble:join", ({ rumbleId }) => {
      if (!rumbleId) return;
      socket.join(`rumble:${rumbleId}`);
    });

    socket.on("rumble:leave", ({ rumbleId }) => {
      if (!rumbleId) return;
      socket.leave(`rumble:${rumbleId}`);
    });

    socket.on("disconnect", () => {
      // optional logging
    });
  });
}
