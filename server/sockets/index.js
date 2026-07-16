import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("join-project", ({projectId,username}) => {
      socket.join(projectId.toString());
      socket.broadcast.to(projectId.toString()).emit("user-joined-project", {
        userId: socket.id,
        username,
      });
    });

    socket.on("leave-project", (projectId) => {
      socket.leave(projectId.toString());
      console.log(`Socket ${socket.id} left project ${projectId}`);
    });

    // File rooms
    socket.on("join-file", (fileId) => {
      socket.join(`file:${fileId}`);
      console.log(`Socket ${socket.id} joined file ${fileId}`);
    });

    socket.on("leave-file", (fileId) => {
      socket.leave(`file:${fileId}`);
      console.log(`Socket ${socket.id} left file ${fileId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized yet");
  return io;
};
