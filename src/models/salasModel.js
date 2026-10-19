const pool = require('../database/db')

async function listarSalas() {
  const query = `SELECT * FROM salas WHERE ativa = TRUE ORDER BY sala_id;`
  const resultado = await pool.query(query)
  return resultado.rows
}

async function listarTodasSalas() {
  const query = `SELECT * FROM salas ORDER BY sala_id;`
  const resultado = await pool.query(query)
  return resultado.rows
}

async function buscarSalaPorId(salaId) {
  const query = `SELECT * FROM salas WHERE sala_id = $1;`
  const resultado = await pool.query(query, [salaId])
  return resultado.rows[0] || null
}

async function cadastrarSala(dadosSala) {
  const query = `
    INSERT INTO salas (sala, pontos, icone, descricao, ativa) 
    VALUES ($1, $2, $3, $4, TRUE) 
    RETURNING *;
  `
  const values = [
    dadosSala.sala, 
    dadosSala.pontos, 
    dadosSala.icone || 'map-pin', 
    dadosSala.descricao || ''
  ]
  const resultado = await pool.query(query, values)
  return resultado.rows[0]
}

async function atualizarSala(salaId, dadosSala) {
  const query = `
    UPDATE salas 
    SET sala = $1, pontos = $2, icone = $3, descricao = $4, ativa = $5 
    WHERE sala_id = $6 
    RETURNING *;
  `
  const values = [
    dadosSala.sala,
    dadosSala.pontos,
    dadosSala.icone || 'map-pin',
    dadosSala.descricao || '',
    dadosSala.ativa !== undefined ? dadosSala.ativa : true,
    salaId
  ]
  const resultado = await pool.query(query, values)
  return resultado.rows[0] || null
}

async function removerSala(salaId) {
  const query = `DELETE FROM salas WHERE sala_id = $1 RETURNING *;`
  const resultado = await pool.query(query, [salaId])
  return resultado.rows[0] || null
}

module.exports = { listarSalas, listarTodasSalas, buscarSalaPorId, cadastrarSala, atualizarSala, removerSala }