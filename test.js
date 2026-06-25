import http from "http";

const server = http.createServer((req, res) => {
  res.end("Hello");
});

server.listen(3000, () => {
  console.log("HTTP server running");
});

process.on("exit", (code) => {
  console.log("EXIT", code);
});