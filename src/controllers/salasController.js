const salasModel = require("../models/salasModel")
const visitasModel = require("../models/locaisVisitasModel")

async function listarSalas(req, res) {
  const salas = await salasModel.listarSalas()
  return res.json(salas)
}

async function listarTodasSalas(req, res) {
  const salas = await salasModel.listarTodasSalas()
  return res.json(salas)
}

async function cadastrarSala(req, res) {
  const sala = await salasModel.cadastrarSala(req.body)
  return res.status(201).json({ sucesso: "Sala cadastrada com sucesso!", sala })
}

async function atualizarSala(req, res) {
  const sala = await salasModel.atualizarSala(Number(req.params.id), req.body)

  if (!sala) {
    return res.status(404).json({ erro: "Sala não encontrada." })
  }

  return res.json({ sucesso: "Sala atualizada com sucesso!", sala })
}

async function removerSala(req, res) {
  const salaId = Number(req.params.id)
  const sala = await salasModel.buscarSalaPorId(salaId)

  if (!sala) {
    return res.status(404).json({ erro: "Sala não encontrada." })
  }

  const visitas = await visitasModel.listarVisitas()

  if (visitas.some(v => Number(v.sala_id) === salaId)) {
    return res.status(409).json({ erro: "Esta sala já possui visitas e não pode ser removida. Desative-a pela edição." })
  }

  await salasModel.removerSala(salaId)

  return res.json({ sucesso: "Sala removida com sucesso!", sala })
}

module.exports = { listarSalas, listarTodasSalas, cadastrarSala, atualizarSala, removerSala }