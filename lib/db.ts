import { Pool, types } from 'pg';

// Force DATE (oid 1082) to be parsed as string
types.setTypeParser(1082, (val) => val);

let connectionString = process.env.DATABASE_URL || '';
// Strip any sslmode parameter from the URL so it doesn't override our manual ssl configuration
connectionString = connectionString.replace(/([?&])sslmode=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export default pool;
