const produtosModel = require("../models/produtosModel")

async function listarProdutos(req, res) {
  const produtos = await produtosModel.listarProdutos()
  return res.json(produtos)
}

async function buscarProduto(req, res) {
  const produto = await produtosModel.buscarProdutoPorId(Number(req.params.id))

  if (!produto) {
    return res.status(404).json({ erro: "Produto não encontrado." })
  }

  return res.json(produto)
}

async function cadastrarProduto(req, res) {
  const produto = await produtosModel.cadastrarProduto(req.body)
  return res.status(201).json({ sucesso: "Produto cadastrado com sucesso!", produto })
}

async function atualizarProduto(req, res) {
  const produto = await produtosModel.atualizarProduto(Number(req.params.id), req.body)

  if (!produto) {
    return res.status(404).json({ erro: "Produto não encontrado." })
  }

  return res.json({ sucesso: "Produto atualizado com sucesso!", produto })
}

async function removerProduto(req, res) {
  const produto = await produtosModel.removerProduto(Number(req.params.id))

  if (!produto) {
    return res.status(404).json({ erro: "Produto não encontrado." })
  }

  return res.json({ sucesso: "Produto removido com sucesso!", produto })
}

module.exports = { listarProdutos, buscarProduto, cadastrarProduto, atualizarProduto, removerProduto }