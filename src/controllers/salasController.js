const salasModel = require("../models/salasModel");
const visitasModel = require("../models/locaisVisitasModel");

async function listarSalas(req, res) {
  try {
    const todasSalas = await salasModel.listarSalas();
    
    if (!Array.isArray(todasSalas)) {
      return res.json([]);
    }

    // Retorna unicamente salas onde 'ativa' é verdadeiro
    const salasAtivas = todasSalas.filter((s) => {
      const status = s.ativa ?? s.ativo ?? s.is_active ?? s.status;
      return status === true || status === 1 || String(status).toLowerCase() === 'true';
    });

    return res.json(salasAtivas);
  } catch (erro) {
    console.error("[ERRO LISTAR SALAS]:", erro);
    return res.status(500).json({ erro: "Erro ao listar salas ativas." });
  }
}

async function listarTodasSalas(req, res) {
  try {
    const salas = await salasModel.listarTodasSalas();
    return res.json(salas);
  } catch (erro) {
    console.error("[ERRO LISTAR TODAS SALAS]:", erro);
    return res.status(500).json({ erro: "Erro ao listar todas as salas." });
  }
}

async function cadastrarSala(req, res) {
  try {
    const sala = await salasModel.cadastrarSala(req.body);
    return res.status(201).json({ sucesso: "Sala cadastrada com sucesso!", sala });
  } catch (erro) {
    console.error("[ERRO CADASTRAR SALA]:", erro);
    return res.status(500).json({ erro: "Erro ao cadastrar a sala." });
  }
}

async function atualizarSala(req, res) {
  try {
    const salaId = Number(req.params.id);

    if (isNaN(salaId)) {
      return res.status(400).json({ erro: "ID da sala inválido." });
    }

    const sala = await salasModel.atualizarSala(salaId, req.body);

    if (!sala) {
      return res.status(404).json({ erro: "Sala não encontrada." });
    }

    return res.json({ sucesso: "Sala atualizada com sucesso!", sala });
  } catch (erro) {
    console.error("[ERRO ATUALIZAR SALA]:", erro);
    return res.status(500).json({ erro: "Erro ao atualizar a sala." });
  }
}

async function removerSala(req, res) {
  try {
    const salaId = Number(req.params.id);

    if (isNaN(salaId)) {
      return res.status(400).json({ erro: "ID de sala inválido enviado na requisição." });
    }

    const sala = await salasModel.buscarSalaPorId(salaId);

    if (!sala) {
      return res.status(404).json({ erro: "Sala não encontrada." });
    }

    const visitas = await visitasModel.listarVisitas();

    if (Array.isArray(visitas) && visitas.some(v => Number(v.sala_id ?? v.salaId) === salaId)) {
      return res.status(409).json({ erro: "Esta sala já possui visitas e não pode ser removida. Desative-a pela edição." });
    }

    await salasModel.removerSala(salaId);

    return res.json({ sucesso: "Sala removida com sucesso!", sala });
  } catch (erro) {
    console.error("[ERRO REMOVER SALA]:", erro);
    return res.status(500).json({ erro: `Erro interno no servidor ao remover sala: ${erro.message}` });
  }
}

module.exports = { listarSalas, listarTodasSalas, cadastrarSala, atualizarSala, removerSala };