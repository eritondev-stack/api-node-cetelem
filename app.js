const express = require("express");
const app = express();
const morgan = require("morgan");

const rotaProdutos = require("./routes/main");
const rotaUsuario = require("./routes/usuario");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/imagens", express.static("uploads"));

// Habiliar o Cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Authorization, Accept"
  );

  next();
});

app.use("/main", rotaProdutos);
app.use("/usuario", rotaUsuario);

// Caso não encontra nenhuma rota acima
app.use((req, res, next) => {
  const error = new Error("Não encontrado");
  error.status = 404;
  next(error);
});

// Pega o erro e responde
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  return res.send({
    erro: {
      msg: error.message
    }
  });
});

module.exports = app;
