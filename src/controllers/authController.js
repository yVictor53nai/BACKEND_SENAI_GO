const jwt = require('jsonwebtoken')
const usuariosModel = require('../models/usuariosModel')

function ehAdmin(email) {
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  return admins.includes(String(email).toLowerCase())
}

async function login(req, res) {
  try {
    const { email, senha } = req.body
    const usuarioLogin = await usuariosModel.login(email, senha)

    if (!usuarioLogin) {
      return res.status(400).json({ erro: "Este email e senha não existem. Verifique se já realizou o cadastro." })
    }

    const admin = ehAdmin(usuarioLogin.email)
    const token = jwt.sign(
      { id: usuarioLogin.id, nome: usuarioLogin.nome, admin },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    const { senha: _senha, ...usuarioSemSenha } = usuarioLogin

    return res.status(200).json({
      sucesso: 'Login efetuado com sucesso',
      usuarioLogin: { ...usuarioSemSenha, admin },
      token
    })
  } catch (erro) {
    return res.status(500).json({ erro: "Erro interno no servidor ao realizar login." })
  }
}

module.exports = login