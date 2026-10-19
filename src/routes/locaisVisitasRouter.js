const express = require("express");
const router = express.Router();
const visitasController = require("../controllers/locaisVisitasController");
const middlewareAutenticar = require("../middlewares/autenticar");
const middlewareVerificarVisita = require("../middlewares/VerificarVisitas");

// Aceita tanto /registrarLocal quanto a rota raiz / para evitar erros de endpoint no frontend
router.post(
  ["/registrarLocal", "/"],
  middlewareAutenticar,
  (req, res, next) => {
    try {
      if (typeof middlewareVerificarVisita === 'function') {
        return middlewareVerificarVisita(req, res, next);
      }
      next();
    } catch (err) {
      console.error("[ERRO NO MIDDLEWARE VERIFICAR VISITA]:", err);
      return res.status(400).json({ message: `Erro ao verificar visita: ${err.message}` });
    }
  },
  visitasController.registrarVisitas
);

router.get("/locais", visitasController.listarVisitas);
router.get("/", visitasController.listarVisitas);

module.exports = router;