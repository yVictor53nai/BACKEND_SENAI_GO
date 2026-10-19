const pool = require('../database/db');

async function salvarVisita(usuarioId, salaId, pontos) {
  try {
    // Convertien dagiti ID iti husto a bilang (INTEGER)
    const uId = parseInt(usuarioId, 10);
    const sId = parseInt(salaId, 10);
    const pts = parseInt(pontos, 10) || 0;

    if (isNaN(uId) || isNaN(sId)) {
      throw new Error(`Invalid inputs: usuarioId=${usuarioId}, salaId=${salaId}`);
    }

    const query = `
      INSERT INTO historico_visitas (usuario_id, sala_id, pontuacao) 
      VALUES ($1, $2, $3) 
      RETURNING *;
    `;

    const resultado = await pool.query(query, [uId, sId, pts]);
    return resultado.rows[0];
  } catch (err) {
    console.error('DATABASE ERROR [salvarVisita]:', err.message);
    throw err;
  }
}

async function listarVisitas() {
  try {
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
  } catch (err) {
    console.error('DATABASE ERROR [listarVisitas]:', err.message);
    throw err;
  }
}

module.exports = { salvarVisita, listarVisitas };