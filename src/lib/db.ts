import { neon } from '@neondatabase/serverless';

// Validate DATABASE_URL existence
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL is not set in environment variables. Falling back to local/in-memory mode if needed.');
}

// Neon HTTP client for Next.js App Router (Server Actions / Route Handlers)
export const sql = neon(databaseUrl || '');

