const pool = require('./database/db')

async function cadastrarUsuario(dadosUsuario) {
  const query = `
    INSERT INTO usuarios (cpf, nome, email, senha) 
    VALUES ($1, $2, $3, $4) 
    RETURNING id, cpf, nome, email, criado_em;
  `
  const values = [dadosUsuario.cpf, dadosUsuario.nome, dadosUsuario.email, dadosUsuario.senha]
  
  const resultado = await pool.query(query, values)
  return resultado.rows[0]
}

async function login(email, senha) {
  const query = `
    SELECT id, cpf, nome, email, criado_em 
    FROM usuarios 
    WHERE email = $1 AND senha = $2;
  `
  const resultado = await pool.query(query, [email, senha])
  return resultado.rows[0] || null
}

async function buscarPorCPF(cpf) {
  const query = `
    SELECT id, cpf, nome, email, criado_em 
    FROM usuarios 
    WHERE cpf = $1;
  `
  const resultado = await pool.query(query, [cpf])
  return resultado.rows[0] || null
}

module.exports = { cadastrarUsuario, login, buscarPorCPF }