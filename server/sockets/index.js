import { Server } from "socket.io";

let io;

// In-memory tracking: { [fileId]: [{ socketId, username }] }
const fileRoomMembers = {};

// In-memory tracking of the LATEST live (unsaved) content per file.
// Updated on every content-change event, cleared once a file's room is
// empty. Used to catch up a newly-joining user to the current live state
// of the room, instead of the (possibly stale) content from the database.
const fileCurrentContent = {};

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

      if (!fileRoomMembers[fileId]) fileRoomMembers[fileId] = [];

      // Was anyone already in this room BEFORE I joined? Determines whether
      // it's meaningful to hand this joiner any tracked live content.
      const hadExistingMembers = fileRoomMembers[fileId].length > 0;

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

      // Also hand them the latest live content, but only if someone was
      // already here AND we've actually tracked a live edit for this file
      // this session — otherwise there's nothing to diverge from the DB.
      socket.emit("existing-file-viewers", {
        fileId,
        viewers: existingMembers.map((m) => ({
          userId: m.socketId,
          username: m.username,
        })),
        latestContent: hadExistingMembers ? fileCurrentContent[fileId] : undefined,
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

        // Room now empty — clear both tracking maps. The next person to
        // open this file should start fresh from the DB, since there's no
        // "live" state left to preserve once everyone's gone.
        if (fileRoomMembers[fileId].length === 0) {
          delete fileRoomMembers[fileId];
          delete fileCurrentContent[fileId];
        }
      }

      socket.broadcast.to(room).emit("user-left-file", {
        userId: socket.id,
        username,
      });
      // console.log(`Socket ${socket.id} left file ${fileId}`);
    });

    socket.on("file:content-change", ({ fileId, content, userId }) => {
      // Track this as the latest live content for the file, so anyone who
      // joins the room AFTER this point gets caught up correctly.
      fileCurrentContent[fileId] = content;

      const room = `file:${fileId}`;
      // Just relay to everyone else in the room — no DB write here, that stays
      // on the existing REST save (Ctrl+S) to avoid hammering Mongo on every keystroke
      socket.broadcast.to(room).emit("file:content-change", { fileId, content, userId });
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
        if (fileRoomMembers[fileId].length === 0) {
          delete fileRoomMembers[fileId];
          delete fileCurrentContent[fileId]; // same cleanup as the graceful leave-file path
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized yet");
  return io;
};