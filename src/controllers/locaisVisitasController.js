const visitasModel = require("../models/locaisVisitasModel");
const salasModel = require("../models/salasModel");

async function registrarVisitas(req, res) {
  try {
    // Extrai o ID do usuário autenticado (suporta id, userId ou id_usuario)
    const usuarioId = req.usuario?.id || req.usuario?.userId || req.usuario?.id_usuario;
    const rawSalaId = req.body?.salaId ?? req.body?.id;

    // 1. Validação de presença de dados
    if (!usuarioId || !rawSalaId) {
      return res.status(400).json({ 
        message: `Dados incompletos! ID Aluno: ${usuarioId || 'ausente'}, ID Sala: ${rawSalaId || 'ausente'}` 
      });
    }

    const numSalaId = Number(rawSalaId);

    // 2. Busca a sala no banco de dados
    let salaCadastrada = null;
    if (!isNaN(numSalaId) && typeof salasModel.buscarSalaPorId === 'function') {
      salaCadastrada = await salasModel.buscarSalaPorId(numSalaId);
    }

    // Fallback: se não encontrou por ID numérico, busca na lista pelo nome/slug
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
        message: `A sala "${rawSalaId}" não está cadastrada no banco de dados.` 
      });
    }

    if (salaCadastrada.ativa !== undefined && !salaCadastrada.ativa) {
      return res.status(400).json({ message: "Esta sala está desativada no momento." });
    }

    const idDaSalaNoBanco = salaCadastrada.sala_id ?? salaCadastrada.id ?? salaCadastrada.salaId;
    const pontosDaSala = salaCadastrada.pontos ?? 5;

    // 3. Salva a visita na base de dados
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
    console.error("[ERRO REGISTRAR VISITA]:", erro);
    return res.status(500).json({ 
      message: `Erro do Servidor: ${erro.message || 'Falha ao salvar visita'}` 
    });
  }
}

async function listarVisitas(req, res) {
  try {
    const todasVisitas = await visitasModel.listarVisitas();
    return res.json(todasVisitas);
  } catch (erro) {
    console.error("[ERRO LISTAR VISITAS]:", erro);
    return res.status(500).json({ message: "Erro ao listar visitas." });
  }
}

module.exports = { registrarVisitas, listarVisitas };