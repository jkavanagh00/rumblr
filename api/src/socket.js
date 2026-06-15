export default function registerChatSocket(io) {
  io.on("connection", (socket) => {
    socket.on("chat:join", ({ chatId }) => {
      if (!chatId) return;
      socket.join(`chat:${chatId}`);
    });

    socket.on("chat:leave", ({ chatId }) => {
      if (!chatId) return;
      socket.leave(`chat:${chatId}`);
    });

    socket.on("disconnect", () => {
      // optional logging
    });
  });
}
