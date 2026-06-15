import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.staging' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n')
  }
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error(err)
  else console.log('Connected to Aiven:', res.rows[0])
  pool.end()
})
