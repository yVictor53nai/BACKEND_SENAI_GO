const express = require("express");
const router = express.Router();
const db = require("../database/db");
const authMiddleware = require("../middlewares/authMiddleware"); // Seu middleware de autenticação/JWT

// 1. REGISTRAR VISITA (Quando o QR Code é lido no frontend)
router.post("/visitas", authMiddleware, async (req, res, next) => {
  const { salaId } = req.body;
  const usuarioId = req.usuario.id; // Obtido do middleware de autenticação

  if (!salaId) {
    return res.status(400).json({ mensagem: "ID da sala é obrigatório." });
  }

  try {
    // Busca a pontuação da sala no banco de dados
    const salaQuery = await db.query(
      "SELECT pontos FROM salas WHERE sala_id = $1",
      [salaId]
    );

    if (salaQuery.rows.length === 0) {
      return res.status(404).json({ mensagem: "Sala não encontrada." });
    }

    const pontuacao = salaQuery.rows[0].pontos || 5;

    // Insere o registro na tabela historico_visitas
    await db.query(
      `INSERT INTO historico_visitas (usuario_id, sala_id, pontuacao)
       VALUES ($1, $2, $3)`,
      [usuarioId, salaId, pontuacao]
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: "Visita registrada com sucesso!",
      pontosGanhos: pontuacao,
    });
  } catch (error) {
    next(error);
  }
});

// 2. OBTER SALAS VISITADAS (Para carregar o status ao abrir a página)
router.get("/visitas/progresso", authMiddleware, async (req, res, next) => {
  const usuarioId = req.usuario.id;

  try {
    // Busca os IDs de todas as salas que o usuário já leu/visitou
    const result = await db.query(
      "SELECT DISTINCT sala_id FROM historico_visitas WHERE usuario_id = $1",
      [usuarioId]
    );

    // Retorna uma lista de strings com os IDs das salas visitadas: ["1", "2", ...]
    const visitedRooms = result.rows.map((row) => String(row.sala_id));

    return res.status(200).json({ visitedRooms });
  } catch (error) {
    next(error);
  }
});

module.exports = router;