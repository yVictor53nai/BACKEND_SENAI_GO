const usuariosModel = require("../models/usuariosModel")

async function cadastrarUsuario(req, res) {
  try {
    const dadosUsuario = req.body

    // Verifica se já existe o CPF cadastrado
    const cpfExistente = await usuariosModel.buscarPorCPF(dadosUsuario.cpf)
    if (cpfExistente) {
      return res.status(400).json({ erro: "CPF já cadastrado." })
    }

    const usuario = await usuariosModel.cadastrarUsuario(dadosUsuario)
    const { senha: _senha, ...usuarioSemSenha } = usuario

    return res.status(201).json({ sucesso: "Usuário cadastrado com sucesso!", usuario: usuarioSemSenha })
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao cadastrar usuário. Verifique se o e-mail/CPF já existem." })
  }
}

module.exports = { cadastrarUsuario }