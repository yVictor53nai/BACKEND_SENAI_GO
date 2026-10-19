const saldoModel = require("../models/saldoModel")

async function obterSaldo(req, res) {
  try {
    const saldo = await saldoModel.calcularSaldo(req.usuario.id)
    return res.json(saldo)
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao consultar saldo de pontos." })
  }
}

async function obterRanking(req, res) {
  try {
    const ranking = await saldoModel.obterRankingGeral()
    return res.json(ranking)
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao gerar o ranking de usuários." })
  }
}

module.exports = { obterSaldo, obterRanking }