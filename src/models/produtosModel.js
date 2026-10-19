const pool = require('../database/db')

async function listarProdutos() {
  const resultado = await pool.query(`SELECT * FROM produtos ORDER BY id;`)
  return resultado.rows
}

async function buscarProdutoPorId(produtoId) {
  const resultado = await pool.query(`SELECT * FROM produtos WHERE id = $1;`, [produtoId])
  return resultado.rows[0] || null
}

async function cadastrarProduto(dadosProduto) {
  const query = `
    INSERT INTO produtos (nome, imagem, pontos, estoque) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *;
  `
  const values = [
    dadosProduto.nome,
    dadosProduto.imagem || '🎁',
    dadosProduto.pontos,
    dadosProduto.estoque
  ]
  const resultado = await pool.query(query, values)
  return resultado.rows[0]
}

async function atualizarProduto(produtoId, dadosProduto) {
  const query = `
    UPDATE produtos 
    SET nome = $1, imagem = $2, pontos = $3, estoque = $4 
    WHERE id = $5 
    RETURNING *;
  `
  const values = [
    dadosProduto.nome,
    dadosProduto.imagem || '🎁',
    dadosProduto.pontos,
    dadosProduto.estoque,
    produtoId
  ]
  const resultado = await pool.query(query, values)
  return resultado.rows[0] || null
}

async function removerProduto(produtoId) {
  const resultado = await pool.query(`DELETE FROM produtos WHERE id = $1 RETURNING *;`, [produtoId])
  return resultado.rows[0] || null
}

async function baixarEstoque(produtoId) {
  const query = `
    UPDATE produtos 
    SET estoque = estoque - 1 
    WHERE id = $1 AND estoque > 0 
    RETURNING *;
  `
  const resultado = await pool.query(query, [produtoId])
  return resultado.rows[0] || null
}

module.exports = { listarProdutos, buscarProdutoPorId, cadastrarProduto, atualizarProduto, removerProduto, baixarEstoque }