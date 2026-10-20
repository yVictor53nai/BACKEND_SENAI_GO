const visitasModel = require("../models/locaisVisitasModel");
const salasModel = require("../models/salasModel");

async function registrarVisitas(req, res) {
  try {
    // 1. Extrai o ID do usuário autenticado
    const usuarioId = req.usuario?.id || req.usuario?.userId || req.usuario?.id_usuario;
    
    // 2. Extrai o dado do QR Code vindo do body
    let rawSalaId = req.body?.salaId ?? req.body?.id ?? req.body?.sala_id;

    // Se o valor for um objeto JSON em string, tenta converter
    if (typeof rawSalaId === 'string' && rawSalaId.startsWith('{')) {
      try {
        const parsed = JSON.parse(rawSalaId);
        rawSalaId = parsed.salaId || parsed.id || parsed.sala_id || rawSalaId;
      } catch (e) {
        // Mantiene o valor original se falhar o parse
      }
    }

    // Limpa espaços extras
    if (typeof rawSalaId === 'string') {
      rawSalaId = rawSalaId.trim();
    }

    if (!usuarioId || !rawSalaId) {
      return res.status(400).json({ 
        message: `Dados inválidos. ID do Usuário: ${usuarioId || 'ausente'}, ID da Sala: ${rawSalaId || 'ausente'}` 
      });
    }

    const numSalaId = Number(rawSalaId);

    // 3. Busca a sala no banco
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
        message: `A sala "${rawSalaId}" não foi encontrada no sistema.` 
      });
    }

    if (salaCadastrada.ativa !== undefined && !salaCadastrada.ativa) {
      return res.status(400).json({ message: "Esta sala está desativada no momento." });
    }

    const idDaSalaNoBanco = salaCadastrada.sala_id ?? salaCadastrada.id ?? salaCadastrada.salaId;
    const pontosDaSala = salaCadastrada.pontos ?? 5;

    // 4. Verifica se já visitou
    const jaVisitou = await visitasModel.buscarVisitaPorUsuarioESala(usuarioId, idDaSalaNoBanco);
    if (jaVisitou) {
      return res.status(400).json({ message: "Esta sala já foi visitada por você!" });
    }

    // 5. Salva a visita
    const localDeVisita = await visitasModel.salvarVisita(
      usuarioId,
      idDaSalaNoBanco,
      pontosDaSala
    );

    // 6. Retorna a lista atualizada para o FrontEnd mudar o status para "Visitado"
    const visitasDoUsuario = await visitasModel.listarSalasVisitadasPorUsuario(usuarioId);

    return res.status(201).json({
      message: "Visita registrada com sucesso!",
      localDeVisita,
      visitedRooms: visitasDoUsuario
    });
  } catch (erro) {
    console.error("[ERRO REGISTRAR VISITA]:", erro);
    return res.status(500).json({ 
      message: `Erro no servidor: ${erro.message || 'Falha ao processar QR Code'}` 
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