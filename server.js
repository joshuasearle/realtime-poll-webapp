const express = require("express");
const http = require("http");
const path = require("path");

const socket = require("socket.io");

const app = express();
const server = http.Server(app);
const io = socket(server);

const port = 8080;

// Can change this poll to any with the same structure

// const pollObj = {
//   question: "Select Your Favourite Component",
//   options: [
//     { label: "Angular", value: 0, votes: 0 },
//     { label: "MongoDB", value: 1, votes: 0 },
//     { label: "Express.js", value: 2, votes: 0 },
//     { label: "Golang", value: 3, votes: 0 },
//     { label: "Python", value: 4, votes: 0 },
//     { label: "C#", value: 5, votes: 0 },
//     { label: "PhP", value: 6, votes: 0 },
//     { label: "C++", value: 7, votes: 0 },
//   ],
// };

const pollObj = {
  question: "Select the best fruit",
  options: [
    { label: "Apple", value: 0, votes: 0 },
    { label: "Banana", value: 1, votes: 0 },
    { label: "Watermelon", value: 2, votes: 0 },
    { label: "Orange", value: 3, votes: 0 },
    { label: "Grapes", value: 4, votes: 0 },
    { label: "Peach", value: 5, votes: 0 },
    { label: "Mango", value: 6, votes: 0 },
  ],
};

app.use("/", express.static(path.join(__dirname, "dist/Week11")));

io.on("connection", (socket) => {
  console.log("new connection made from client with ID=" + socket.id);

  // Send poll only to the the connection that just connected
  socket.emit("newPoll", { msg: pollObj, timeStamp: getCurrentDate() });

  // When a socket votes, do this
  socket.on("vote", (pollValue) => {
    pollObj.options[pollValue].votes += 1;
    // Send new pollObj to all connected sockets except socket that voted
    socket.broadcast.emit("newPoll", {
      msg: pollObj,
      timeStamp: getCurrentDate(),
    });
  });
});

const getCurrentDate = () => {
  const date = new Date();
  return date.toLocaleString();
};

server.listen(port, () => {
  console.log("Listening on port " + port);
});
