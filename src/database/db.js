const { Pool } = require('pg')

const pool = new Pool({
  user: 'neondb_owner',
  host: 'ep-still-breeze-b6te824e-pooler.c-2.sa-east-1.aws.neon.tech',
  database: 'neondb',
  password: 'npg_oZKvbaVp6I5e',
  port: 5432,
})

module.exports = pool