// sockets/index.js
import { Server } from "socket.io";

let io;

// In-memory tracking: { [fileId]: [{ socketId, username }] }
const fileRoomMembers = {};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("join-project", ({ projectId, username }) => {
      socket.join(projectId.toString());
      socket.broadcast.to(projectId.toString()).emit("user-joined-project", {
        userId: socket.id,
        username,
      });
    });

    socket.on("leave-project", ({ projectId, username }) => {
      socket.leave(projectId.toString());
      socket.broadcast.to(projectId.toString()).emit("user-left-project", {
        userId: socket.id,
        username,
      });
    });

    // File rooms
    socket.on("join-file", ({ fileId, username }) => {
      const room = `file:${fileId}`;
      socket.join(room);

      // Track this member
      if (!fileRoomMembers[fileId]) fileRoomMembers[fileId] = [];
      fileRoomMembers[fileId].push({ socketId: socket.id, username });

      // Tell everyone ELSE already in the room that a new person joined
      socket.broadcast.to(room).emit("user-joined-file", {
        userId: socket.id,
        username,
      });

      // Tell the NEW joiner who is ALREADY in the room (excluding themselves)
      const existingMembers = fileRoomMembers[fileId].filter(
        (m) => m.socketId !== socket.id
      );
      socket.emit("existing-file-viewers", {
        fileId,
        viewers: existingMembers.map((m) => ({ userId: m.socketId, username: m.username })),
      });

      // console.log(`Socket ${socket.id} joined file ${fileId}`);
    });

    socket.on("leave-file", ({ fileId, username }) => {
      const room = `file:${fileId}`;
      socket.leave(room);

      if (fileRoomMembers[fileId]) {
        fileRoomMembers[fileId] = fileRoomMembers[fileId].filter(
          (m) => m.socketId !== socket.id
        );
        if (fileRoomMembers[fileId].length === 0) delete fileRoomMembers[fileId];
      }

      socket.broadcast.to(room).emit("user-left-file", {
        userId: socket.id,
        username,
      });
      // console.log(`Socket ${socket.id} left file ${fileId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);

      // Clean up this socket from any file room it was tracked in
      for (const fileId in fileRoomMembers) {
        const before = fileRoomMembers[fileId].length;
        fileRoomMembers[fileId] = fileRoomMembers[fileId].filter(
          (m) => m.socketId !== socket.id
        );
        if (fileRoomMembers[fileId].length !== before) {
          socket.broadcast.to(`file:${fileId}`).emit("user-left-file", {
            userId: socket.id,
          });
        }
        if (fileRoomMembers[fileId].length === 0) delete fileRoomMembers[fileId];
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized yet");
  return io;
};