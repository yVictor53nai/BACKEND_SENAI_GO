const visitasModel = require("../models/locaisVisitasModel");
const pool = require("../database/db");

async function registrarVisitas(req, res) {
  try {
    const usuarioId = req.usuario?.id || req.usuario?.userId || req.usuario?.id_usuario;
    const rawSalaId = req.body.salaId ?? req.body.id;

    if (!usuarioId || !rawSalaId) {
      return res.status(400).json({ message: "Dados incompletos para registrar a visita." });
    }

    // 1. Busca a sala real no PostgreSQL (procura por sala_id OU pelo nome/código '3213')
    const querySala = `
      SELECT sala_id, sala, pontos, ativa 
      FROM salas 
      WHERE sala_id = $1 OR LOWER(sala) = LOWER($2) 
      LIMIT 1;
    `;
    
    // Se for número usa o valor, se for texto passa 0 no parâmetro numérico para não quebrar a query
    const numId = !isNaN(Number(rawSalaId)) ? Number(rawSalaId) : 0;
    const resSala = await pool.query(querySala, [numId, String(rawSalaId)]);
    const salaCadastrada = resSala.rows[0];

    if (!salaCadastrada) {
      return res.status(404).json({ message: "Sala não encontrada no banco de dados." });
    }

    if (salaCadastrada.ativa !== undefined && !salaCadastrada.ativa) {
      return res.status(400).json({ message: "Esta sala está desativada." });
    }

    // 2. Verifica se o aluno JÁ visitou esta sala para evitar o Erro 500 de violação UNIQUE
    const queryCheck = `
      SELECT id FROM historico_visitas 
      WHERE usuario_id = $1 AND sala_id = $2 
      LIMIT 1;
    `;
    const checkVisita = await pool.query(queryCheck, [usuarioId, salaCadastrada.sala_id]);

    if (checkVisita.rows.length > 0) {
      return res.status(409).json({ message: "Você já visitou esta área." });
    }

    // 3. Grava a visita usando o ID numérico real da tabela salas
    const localDeVisita = await visitasModel.salvarVisita(
      usuarioId,
      salaCadastrada.sala_id,
      salaCadastrada.pontos || 5
    );

    return res.status(201).json({
      message: "Visita registrada com sucesso!",
      localDeVisita,
    });
  } catch (erro) {
    console.error("[ERRO CRÍTICO NO BACKEND]:", erro);
    return res.status(500).json({ 
      message: "Erro interno no servidor ao registrar visita.", 
      detalhe: erro.message 
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