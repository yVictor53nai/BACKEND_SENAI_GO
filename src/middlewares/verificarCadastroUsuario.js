const usuariosModel = require("../models/usuariosModel");

async function verificarUsuarioExistente(req, res, next) {
    const { cpf } = req.body;

    const usuario = await usuariosModel.buscarPorCPF(cpf);
    console.log(usuario)
    if (usuario) {
        return res.status(409).json({
            erro: "Já existe um usuário cadastrado com este CPF."
        });
    }

    next();
}

module.exports = verificarUsuarioExistente;