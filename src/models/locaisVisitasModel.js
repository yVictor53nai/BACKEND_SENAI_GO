const pool = require('../database/db');

async function salvarVisita(usuarioId, salaId, pontos) {
  try {
    const uId = parseInt(usuarioId, 10);
    const sId = parseInt(salaId, 10);
    const pts = parseInt(pontos, 10) || 0;

    if (isNaN(uId) || isNaN(sId)) {
      throw new Error(`Identificadores inválidos: usuarioId=${usuarioId}, salaId=${salaId}`);
    }

    const query = `
      INSERT INTO historico_visitas (usuario_id, sala_id, pontuacao) 
      VALUES ($1, $2, $3) 
      RETURNING *;
    `;

    const resultado = await pool.query(query, [uId, sId, pts]);
    return resultado.rows[0];
  } catch (err) {
    console.error("DATABASE ERROR [salvarVisita]:", err.message);
    throw err;
  }
}

async function buscarVisitaPorUsuarioESala(usuarioId, salaId) {
  try {
    const query = `
      SELECT * FROM historico_visitas 
      WHERE usuario_id = $1 AND sala_id = $2 
      LIMIT 1;
    `;
    const resultado = await pool.query(query, [usuarioId, salaId]);
    return resultado.rows[0] || null;
  } catch (err) {
    console.error("DATABASE ERROR [buscarVisitaPorUsuarioESala]:", err.message);
    throw err;
  }
}

async function listarSalasVisitadasPorUsuario(usuarioId) {
  try {
    const query = `
      SELECT DISTINCT CAST(sala_id AS VARCHAR) AS sala_id 
      FROM historico_visitas 
      WHERE usuario_id = $1;
    `;
    const resultado = await pool.query(query, [usuarioId]);
    return resultado.rows.map(row => String(row.sala_id));
  } catch (err) {
    console.error("DATABASE ERROR [listarSalasVisitadasPorUsuario]:", err.message);
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
    console.error("DATABASE ERROR [listarVisitas]:", err.message);
    throw err;
  }
}

module.exports = { 
  salvarVisita, 
  buscarVisitaPorUsuarioESala, 
  listarSalasVisitadasPorUsuario, 
  listarVisitas 
};