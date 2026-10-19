const produtosModel = require("../models/produtosModel")
const resgatesModel = require("../models/resgatesModel")
const saldoModel = require("../models/saldoModel")

async function resgatarProduto(req, res) {
  try {
    const { id } = req.usuario
    const produto = await produtosModel.buscarProdutoPorId(req.body.produtoId)

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado." })
    }

    if (produto.estoque <= 0) {
      return res.status(409).json({ erro: "Este produto está esgotado." })
    }

    const { saldo } = await saldoModel.calcularSaldo(id)

    if (saldo < produto.pontos) {
      return res.status(400).json({ erro: `Pontos insuficientes. Você tem ${saldo} e o produto custa ${produto.pontos}.` })
    }

    await produtosModel.baixarEstoque(produto.id)
    const resgate = await resgatesModel.salvarResgate(id, produto)
    const novoSaldo = await saldoModel.calcularSaldo(id)

    return res.status(201).json({ sucesso: "Produto resgatado com sucesso!", resgate, ...novoSaldo })
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao processar o resgate do produto." })
  }
}

async function listarResgates(req, res) {
  try {
    const resgates = await resgatesModel.listarResgatesDoUsuario(req.usuario.id)
    return res.json(resgates)
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao buscar histórico de resgates." })
  }
}

module.exports = { resgatarProduto, listarResgates }