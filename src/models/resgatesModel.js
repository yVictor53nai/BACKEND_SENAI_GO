const pool = require('../database/db')

async function salvarResgate(usuarioId, produto) {
  const query = `
    INSERT INTO historico_resgates (usuario_id, produto_id, produto_nome, produto_imagem, pontos) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *;
  `
  const values = [
    usuarioId,
    produto.id,
    produto.nome,
    produto.imagem,
    produto.pontos
  ]
  const resultado = await pool.query(query, values)
  return resultado.rows[0]
}

async function listarResgatesDoUsuario(usuarioId) {
  const query = `SELECT * FROM historico_resgates WHERE usuario_id = $1 ORDER BY criado_em DESC;`
  const resultado = await pool.query(query, [usuarioId])
  return resultado.rows
}

module.exports = { salvarResgate, listarResgatesDoUsuario }