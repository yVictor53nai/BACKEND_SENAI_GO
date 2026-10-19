const visitasModel = require("../models/locaisVisitasModel");
const salasModel = require("../models/salasModel");

async function registrarVisitas(req, res) {
  try {
    // 1. Garante a extração do ID do utilizador autenticado (suporta id, userId ou id_usuario)
    const usuarioId = req.usuario?.id || req.usuario?.userId || req.usuario?.id_usuario;
    const rawSalaId = req.body.salaId ?? req.body.id;

    if (!usuarioId || !rawSalaId) {
      return res.status(400).json({ message: "Dados incompletos para registrar a visita." });
    }

    // 2. Converte para número se for numérico, senão mantém como string
    const salaId = !isNaN(Number(rawSalaId)) ? Number(rawSalaId) : String(rawSalaId);

    // 3. Busca a sala no banco de dados (tenta busca por número ou por identificador textual)
    let salaCadastrada = null;
    if (typeof salasModel.buscarSalaPorId === 'function') {
      salaCadastrada = await salasModel.buscarSalaPorId(salaId);
    }

    // Fallback: Se a busca por ID direto não encontrar, tenta listar e encontrar pelo nome/slug
    if (!salaCadastrada && typeof salasModel.listarSalas === 'function') {
      const salas = await salasModel.listarSalas();
      salaCadastrada = salas.find(
        (s) =>
          String(s.sala_id ?? s.id ?? s.salaId) === String(salaId) ||
          String(s.sala ?? s.nome).toLowerCase() === String(salaId).toLowerCase()
      );
    }

    if (!salaCadastrada || (salaCadastrada.ativa !== undefined && !salaCadastrada.ativa)) {
      return res.status(404).json({ message: "Sala não encontrada ou desativada." });
    }

    const idDaSalaNoBanco = salaCadastrada.sala_id ?? salaCadastrada.id ?? salaCadastrada.salaId;
    const pontosDaSala = salaCadastrada.pontos ?? 5;

    // 4. Salva a visita na base de dados
    const localDeVisita = await visitasModel.salvarVisita(
      usuarioId,
      idDaSalaNoBanco,
      pontosDaSala
    );

    return res.status(201).json({
      message: "Visita registrada com sucesso!",
      localDeVisita,
    });
  } catch (erro) {
    console.error("[ERRO NO SERVIDOR - registrarVisita]:", erro);
    return res.status(500).json({ message: "Erro interno no servidor ao registrar visita.", detalhe: erro.message });
  }
}

async function listarVisitas(req, res) {
  try {
    const todasVisitas = await visitasModel.listarVisitas();
    return res.json(todasVisitas);
  } catch (erro) {
    console.error("[ERRO NO SERVIDOR - listarVisitas]:", erro);
    return res.status(500).json({ message: "Erro ao listar visitas." });
  }
}

module.exports = { registrarVisitas, listarVisitas };