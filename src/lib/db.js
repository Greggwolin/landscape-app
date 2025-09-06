// src/lib/db.js
import { neon } from '@neondatabase/serverless';

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE, PGCHANNELBINDING } = process.env;
  if (PGHOST && PGDATABASE && PGUSER && PGPASSWORD) {
    const ssl = `sslmode=${PGSSLMODE || 'require'}`;
    const cb  = PGCHANNELBINDING ? `&channel_binding=${PGCHANNELBINDING}` : '';
    return `postgres://${encodeURIComponent(PGUSER)}:${encodeURIComponent(PGPASSWORD)}@${PGHOST}/${PGDATABASE}?${ssl}${cb}`;
  }
  throw new Error('Missing DATABASE_URL or PG* environment variables');
}

// Tagged template that defers connecting until request time
export function sql(strings, ...values) {
  const client = neon(getDatabaseUrl());
  return client(strings, ...values);
}

