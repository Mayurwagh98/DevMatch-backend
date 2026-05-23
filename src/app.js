const express = require("express");
const connectDB = require("./config/database");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.router");
const profileRouter = require("./routes/profile.router");
const connectionRequestRouter = require("./routes/connectionRequest.router");
const requestesReceived = require("./routes/user.router");
const chatRouter = require("./routes/chat.router");
const cors = require("cors");
const http = require("http");
const initializeSocket = require("./utils/socket");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "https://dev-match-frontend-sand.vercel.app",
    ],

    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRequestRouter);
app.use("/", requestesReceived);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("connected to database");
    server.listen(8000, () => {
      console.log("server is running on port 8000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
