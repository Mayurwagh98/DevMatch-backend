const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/Chat");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: [
        "http://localhost:5174",
        "https://dev-match-frontend-sand.vercel.app",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // create chat room
    socket.on("joinChat", ({ firstName, userId, receiverId }) => {
      const roomId = getSecretRoomId(userId, receiverId);
      console.log(firstName + "joined room" + roomId);
      socket.join(roomId);
    });

    // send message to room
    socket.on(
      "sendMessage",
      async ({
        firstName,
        lastName,
        photoUrl,
        userId,
        receiverId,
        message,
        createdAt,
      }) => {
        try {
          const roomId = getSecretRoomId(userId, receiverId);
          console.log(firstName + "sent message" + message);

          let chatExists = await Chat.findOne({
            members: { $all: [userId, receiverId] },
          });

          if (!chatExists) {
            chatExists = new Chat({
              members: [userId, receiverId],
              messages: [],
            });
          }

          chatExists.messages.push({
            sender: userId,
            message,
          });

          await chatExists.save();

          // send message to room
          io.to(roomId).emit("messageReceived", {
            firstName,
            lastName,
            photoUrl,
            message,
            createdAt,
          });
        } catch (error) {
          console.log("error:", error);
          return error;
        }
      },
    );
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

module.exports = initializeSocket;
