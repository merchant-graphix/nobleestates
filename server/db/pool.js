import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.PGUSER || 'lotus',
  database: process.env.PGDATABASE || 'real_estate',
  host: process.env.PGHOST || '/var/run/postgresql',
  port: process.env.PGPORT || 5432,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
