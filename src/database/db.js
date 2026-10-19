require('dotenv').config();
const { Pool } = require("pg");

// Log para confirmar no terminal qual URL está sendo lida
console.log("--> URL do Banco:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Obrigatório para aceitar a conexão do Neon
  },
});

module.exports = pool;