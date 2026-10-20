const visitasModel = require("../models/locaisVisitasModel");
const salasModel = require("../models/salasModel");

async function verificarVisita(req, res, next) {
  try {
    const usuarioId = req.usuario?.id || req.usuario?.userId || req.usuario?.id_usuario;
    let rawSalaId = req.body?.salaId ?? req.body?.id ?? req.body?.sala_id;

    if (!usuarioId || !rawSalaId) {
      return res.status(400).json({ message: "Dados incompletos para verificar a visita." });
    }

    // 1. Tenta resolver a sala para pegar o ID correto do banco
    let salaIdReal = rawSalaId;
    if (typeof salasModel.listarSalas === 'function') {
      const todasSalas = await salasModel.listarSalas();
      const salaEncontrada = todasSalas.find(
        (s) =>
          String(s.sala_id ?? s.id ?? s.salaId) === String(rawSalaId) ||
          String(s.sala ?? s.nome).toLowerCase() === String(rawSalaId).toLowerCase()
      );
      if (salaEncontrada) {
        salaIdReal = salaEncontrada.sala_id ?? salaEncontrada.id ?? salaEncontrada.salaId;
      }
    }

    // 2. Verifica se o usuário já visitou este ID
    const jaVisitou = await visitasModel.buscarVisitaPorUsuarioESala(usuarioId, salaIdReal);

    if (jaVisitou) {
      return res.status(400).json({ message: "Esta sala já foi visitada por você!" });
    }

    // Passa a sala já resolvida no req.body para o controller
    req.body.salaId = salaIdReal;

    next();
  } catch (erro) {
    console.error("[ERRO NO MIDDLEWARE VERIFICAR VISITA]:", erro);
    next();
  }
}

module.exports = verificarVisita;