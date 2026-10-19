const pool = require('./database/db')

async function salvarVisita(usuarioId, salaId, pontos) {
  const query = `
    INSERT INTO historico_visitas (usuario_id, sala_id, pontuacao) 
    VALUES ($1, $2, $3) 
    RETURNING *;
  `
  const resultado = await pool.query(query, [usuarioId, salaId, pontos])
  return resultado.rows[0]
}

async function listarVisitas() {
  const query = `
    SELECT hv.id, hv.usuario_id AS id, u.nome, hv.sala_id, s.sala, hv.pontuacao AS pontuacao, hv.criado_em 
    FROM historico_visitas hv
    JOIN usuarios u ON hv.usuario_id = u.id
    JOIN salas s ON hv.sala_id = s.sala_id;
  `
  const resultado = await pool.query(query)
  return resultado.rows
}

module.exports = { salvarVisita, listarVisitas }