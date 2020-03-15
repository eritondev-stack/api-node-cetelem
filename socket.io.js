// eslint-disable-next-line no-undef
module.exports = io.on("connection", socket => {
  console.log("Alguem conectou");

  socket.on("disconnect", () => {
    console.log("Alguem saiu");
  });

  socket.on("enviar", dados => {
    enviei(dados);
  });

  // eslint-disable-next-line no-undef
  io.emit("get", { msg: "Cheguei no primeiro modulo" });

  // eslint-disable-next-line no-undef
  const enviei = dados => io.emit("receber", dados);
});
