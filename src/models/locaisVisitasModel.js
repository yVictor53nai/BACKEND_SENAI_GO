const pool = require('../database/db');

async function salvarVisita(usuarioId, salaId, pontos) {
  // 1. Garante que usuarioId seja um número inteiro
  const uId = parseInt(usuarioId, 10);

  // 2. Garante que salaId seja convertido para INTEGER para o PostgreSQL
  const sId = parseInt(salaId, 10);

  if (isNaN(uId) || isNaN(sId)) {
    throw new Error(`Valores inválidos para salvar visita. usuarioId: ${usuarioId}, salaId: ${salaId}`);
  }

  const query = `
    INSERT INTO historico_visitas (usuario_id, sala_id, pontuacao) 
    VALUES ($1, $2, $3) 
    RETURNING *;
  `;

  const resultado = await pool.query(query, [uId, sId, Number(pontos) || 0]);
  return resultado.rows[0];
}

async function listarVisitas() {
  const query = `
    SELECT 
      hv.id AS visita_id, 
      hv.usuario_id AS usuario_id, 
      hv.usuario_id AS id, 
      u.nome, 
      hv.sala_id AS sala_id, 
      hv.sala_id AS salaId, 
      s.sala, 
      hv.pontuacao, 
      hv.criado_em 
    FROM historico_visitas hv
    JOIN usuarios u ON hv.usuario_id = u.id
    JOIN salas s ON hv.sala_id = s.sala_id;
  `;
  const resultado = await pool.query(query);
  return resultado.rows;
}

module.exports = { salvarVisita, listarVisitas };