const visitasModel = require("../models/locaisVisitasModel")
const salasModel = require("../models/salasModel")

async function registrarVisitas(req, res) {
  try {
    const { id } = req.usuario || {}
    const { salaId } = req.body

    if (!id || !salaId) {
      return res.status(400).json({ erro: "Dados incompletos para registrar a visita." })
    }

    const salaCadastrada = await salasModel.buscarSalaPorId(Number(salaId))

    if (!salaCadastrada || !salaCadastrada.ativa) {
      return res.status(404).json({ erro: "Sala não encontrada ou desativada." })
    }

    const localDeVisita = await visitasModel.salvarVisita(id, salaCadastrada.sala_id, salaCadastrada.pontos)

    return res.status(201).json({ sucesso: "Visita registrada com sucesso!", localDeVisita })
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao registrar visita." })
  }
}

async function listarVisitas(req, res) {
  try {
    const todasVisitas = await visitasModel.listarVisitas()
    return res.json(todasVisitas)
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao listar visitas." })
  }
}

module.exports = { registrarVisitas, listarVisitas }