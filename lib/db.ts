import { Pool, types } from 'pg';

// Force DATE (oid 1082) to be parsed as string
types.setTypeParser(1082, (val) => val);

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes('sslmode=require')) {
  // Replace require with verify-full to resolve the pg SSL warning and ensure compatibility
  connectionString = connectionString.replace('sslmode=require', 'sslmode=verify-full');
}

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('sslmode=verify-full') 
    ? { rejectUnauthorized: true } 
    : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});


export default pool;
