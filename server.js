require("dotenv").config();

const express = require("express");
const cors = require("cors");
const server = express();
const PORTA = process.env.PORT || 3000;

const db = require("./src/database/db");

const usuarioRoutes = require("./src/routes/usuariosRouter");
const logger = require("./src/middlewares/logger");
const validarContentType = require("./src/middlewares/validarContetType");
const authRotas = require("./src/routes/authRouter");
const visitasRoutes = require("./src/routes/locaisVisitasRouter");
const salasRoutes = require("./src/routes/salasRouter");
const produtosRoutes = require("./src/routes/produtosRouter");
const resgatesRoutes = require("./src/routes/resgatesRouter");
const saldoRoutes = require("./src/routes/saldoRouter");
const {
  rotaNaoEncontrada,
  tratarErros,
} = require("./src/middlewares/tratarErros");

server.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
  }),
);
server.use(express.json());
server.use(validarContentType);
server.use(logger);
server.use("/auth", authRotas);
server.use(usuarioRoutes);
server.use(visitasRoutes);
server.use(salasRoutes);
server.use(produtosRoutes);
server.use(resgatesRoutes);
server.use(saldoRoutes);
server.use(rotaNaoEncontrada);
server.use(tratarErros);

server.listen(PORTA, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORTA}`);

  db.query("SELECT now()", (err, res) => {
    if (err) {
      console.error("Erro ao se conectar ao banco: ", err.message);
    } else {
      console.log("Banco Conectado: ", res.rows[0].now);
    }
  });
});
