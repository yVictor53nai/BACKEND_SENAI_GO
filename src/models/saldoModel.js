const pool = require('./database/db')

async function calcularSaldo(usuarioId) {
  const query = `
    SELECT 
      COALESCE((SELECT SUM(pontuacao) FROM historico_visitas WHERE usuario_id = $1), 0) AS pontos_ganhos,
      COALESCE((SELECT SUM(pontos) FROM historico_resgates WHERE usuario_id = $1), 0) AS pontos_gastos
  `
  const resultado = await pool.query(query, [usuarioId])
  const { pontos_ganhos, pontos_gastos } = resultado.rows[0]

  return {
    pontosGanhos: Number(pontos_ganhos),
    pontosGastos: Number(pontos_gastos),
    saldo: Number(pontos_ganhos) - Number(pontos_gastos)
  }
}

// Extra: Função para gerar o ranking geral do Administrador
async function obterRankingGeral() {
  const query = `
    SELECT 
        u.id,
        u.nome,
        u.email,
        (COALESCE(v.total_ganhos, 0) - COALESCE(r.total_gastos, 0)) AS saldo_atual
    FROM usuarios u
    LEFT JOIN (
        SELECT usuario_id, SUM(pontuacao) AS total_ganhos 
        FROM historico_visitas 
        GROUP BY usuario_id
    ) v ON u.id = v.usuario_id
    LEFT JOIN (
        SELECT usuario_id, SUM(pontos) AS total_gastos 
        FROM historico_resgates 
        GROUP BY usuario_id
    ) r ON u.id = r.usuario_id
    ORDER BY saldo_atual DESC;
  `
  const resultado = await pool.query(query)
  return resultado.rows
}

module.exports = { calcularSaldo, obterRankingGeral }