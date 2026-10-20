const jwt = require("jsonwebtoken")
const { promisify } = require("util")

const verifyAsync = promisify(jwt.verify)

async function autenticar(req, res, next) {
    const authHeaders = req.headers["authorization"]

    if (!authHeaders) {
        return res.status(401).json({
            erro: "Token de autenticação não enviado."
        })
    }

    const token = authHeaders.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            erro: "Token inválido."
        })
    }

    try {
        // Agora executado de forma assíncrona sem bloquear a thread principal
        const payload = await verifyAsync(token, process.env.JWT_SECRET)

        req.usuario = payload

        return next()

    } catch (erro) {

        if (erro.name === "TokenExpiredError") {
            return res.status(401).json({
                erro: "Token expirado. Faça login novamente."
            })
        }

        return res.status(401).json({
            erro: "Token inválido."
        })
    }
}

module.exports = autenticar