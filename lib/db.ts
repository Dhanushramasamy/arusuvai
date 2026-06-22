import { Pool, types } from 'pg';

// Force DATE (oid 1082) to be parsed as string
types.setTypeParser(1082, (val) => val);

// Singleton pg Pool — reused across requests in Node.js runtime
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export default pool;
