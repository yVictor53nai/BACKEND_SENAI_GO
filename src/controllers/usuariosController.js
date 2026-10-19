const usuariosModel = require("../models/usuariosModel");

async function cadastrarUsuario(req, res) {
  try {
    const dadosUsuario = req.body;
    console.log("--> Dados recebidos no controller:", dadosUsuario);

    // 1. Verifica se o CPF já existe
    const cpfExistente = await usuariosModel.buscarPorCPF(dadosUsuario.cpf);
    if (cpfExistente) {
      console.log("--> CPF já encontrado na BD:", cpfExistente);
      return res.status(400).json({ erro: "CPF já cadastrado." });
    }

    // 2. Regista o utilizador no banco
    const usuario = await usuariosModel.cadastrarUsuario(dadosUsuario);
    console.log("--> Utilizador inserido com sucesso:", usuario);

    return res.status(201).json({ 
      sucesso: "Usuário cadastrado com sucesso!", 
      usuario 
    });

  } catch (erro) {
    // IMPORTANTE: Imprime o erro real do PostgreSQL no terminal
    console.error("--> ERRO DETALHADO NO CADASTRO:", erro);

    // Trata erro de chave duplicada (E-mail ou CPF únicos no Postgres)
    if (erro.code === '23505') {
      return res.status(409).json({ erro: "E-mail ou CPF já cadastrado no sistema." });
    }

    return res.status(500).json({ erro: "Erro interno ao cadastrar usuário." });
  }
}

module.exports = { cadastrarUsuario };