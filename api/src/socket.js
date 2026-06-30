import jwt from "jsonwebtoken";
import { isUserParticipantInRumble_model } from "./models/rumbles.js";

export default function registerRumbleSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      socket.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("rumble:join", async ({ rumbleId }) => {
      try {
        if (!rumbleId) return;
        const isParticipant = await isUserParticipantInRumble_model(
          rumbleId,
          socket.user.id,
        );
        if (isParticipant) socket.join(`rumble:${rumbleId}`);
      } catch (error) {
        socket.emit("error", { message: "Failed to join rumble" });
      }
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
