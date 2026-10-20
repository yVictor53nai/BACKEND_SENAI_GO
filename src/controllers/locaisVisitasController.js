const visitasModel = require("../models/locaisVisitasModel");
const salasModel = require("../models/salasModel");

async function registrarVisitas(req, res) {
  try {
    console.log("[DEBUG REGISTRAR VISITA] req.usuario:", req.usuario);
    console.log("[DEBUG REGISTRAR VISITA] req.body:", req.body);

    const usuarioId = req.usuario?.id || req.usuario?.userId || req.usuario?.id_usuario;
    let rawSalaId = req.body?.salaId ?? req.body?.id ?? req.body?.sala_id;

    if (!usuarioId) {
      return res.status(401).json({ 
        message: "Sessão expirada ou utilizador não autenticado. Faça login novamente no telemóvel." 
      });
    }

    if (!rawSalaId) {
      return res.status(400).json({ 
        message: "QR Code inválido ou não reconhecido. Tente escanear novamente." 
      });
    }

    const numSalaId = Number(rawSalaId);

    let salaCadastrada = null;
    if (!isNaN(numSalaId) && typeof salasModel.buscarSalaPorId === 'function') {
      salaCadastrada = await salasModel.buscarSalaPorId(numSalaId);
    }

    if (!salaCadastrada && typeof salasModel.listarSalas === 'function') {
      const todasSalas = await salasModel.listarSalas();
      salaCadastrada = todasSalas.find(
        (s) =>
          String(s.sala_id ?? s.id ?? s.salaId) === String(rawSalaId) ||
          String(s.sala ?? s.nome).toLowerCase() === String(rawSalaId).toLowerCase()
      );
    }

    if (!salaCadastrada) {
      return res.status(404).json({ 
        message: `A sala "${rawSalaId}" não foi encontrada no banco de dados.` 
      });
    }

    const idDaSalaNoBanco = salaCadastrada.sala_id ?? salaCadastrada.id ?? salaCadastrada.salaId;
    const pontosDaSala = salaCadastrada.pontos ?? 5;

    const jaVisitou = await visitasModel.buscarVisitaPorUsuarioESala(usuarioId, idDaSalaNoBanco);
    if (jaVisitou) {
      return res.status(400).json({ message: "Esta sala já foi visitada por você!" });
    }

    const localDeVisita = await visitasModel.salvarVisita(
      usuarioId,
      idDaSalaNoBanco,
      pontosDaSala
    );

    const visitasDoUsuario = await visitasModel.listarSalasVisitadasPorUsuario(usuarioId);

    return res.status(201).json({
      message: "Visita registrada com sucesso!",
      localDeVisita,
      visitedRooms: visitasDoUsuario
    });
  } catch (erro) {
    console.error("[ERRO REGISTRAR VISITA]:", erro);
    return res.status(500).json({ 
      message: `Erro interno no servidor: ${erro.message}` 
    });
  }
}

async function listarVisitas(req, res) {
  try {
    const usuarioId = req.usuario?.id || req.usuario?.userId || req.usuario?.id_usuario;
    
    if (usuarioId) {
      const visitasUsuario = await visitasModel.listarSalasVisitadasPorUsuario(usuarioId);
      return res.json(visitasUsuario);
    }

    const todasVisitas = await visitasModel.listarVisitas();
    return res.json(todasVisitas);
  } catch (erro) {
    console.error("[ERRO LISTAR VISITAS]:", erro);
    return res.status(500).json({ message: "Erro ao listar visitas." });
  }
}

module.exports = { registrarVisitas, listarVisitas };