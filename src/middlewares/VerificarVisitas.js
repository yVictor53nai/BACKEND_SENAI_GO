const visitasModel = require("../models/locaisVisitasModel");

async function verificarVisita(req, res, next) {
  try {
    // 1. Extrai o ID do utilizador autenticado
    const usuarioId = req.usuario?.id || req.usuario?.userId || req.usuario?.id_usuario;
    // 2. Extrai o ID da sala recebido no corpo da requisição
    const rawSalaId = req.body?.salaId ?? req.body?.id;

    if (!usuarioId || !rawSalaId) {
      return res.status(400).json({ message: "Dados incompletos para verificar a visita." });
    }

    // 3. Aguarda a lista de visitas da base de dados (obrigatorio uso de await)
    const todasVisitas = await visitasModel.listarVisitas();

    if (!Array.isArray(todasVisitas)) {
      return next(); // Se a lista falhar, deixa avançar para o controller tratar
    }

    // 4. Procura se este utilizador já visitou esta sala (compara como String para evitar erros de tipos)
    const registrado = todasVisitas.find((v) => {
      const vUserId = v.usuario_id ?? v.userId ?? v.id_usuario ?? v.id;
      const vSalaId = v.sala_id ?? v.salaId ?? v.id;

      return (
        String(vUserId) === String(usuarioId) &&
        String(vSalaId) === String(rawSalaId)
      );
    });

    if (registrado) {
      return res.status(409).json({ message: "O local já foi visitado!" });
    }

    // Se não foi visitado, avança para o controller registar
    next();
  } catch (erro) {
    console.error("[ERRO NO MIDDLEWARE VERIFICAR VISITA]:", erro);
    // Se ocorrer um erro interno na busca, passa ao proximo middleware/controller em vez de derrubar com erro 500
    next();
  }
}

module.exports = verificarVisita;