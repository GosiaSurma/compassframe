import { Pool, PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../../shared/schema.js";

const databaseUrl = process.env.DATABASE_URL;
const databaseEnabled = !!databaseUrl;

export function isDatabaseEnabled() {
  return databaseEnabled;
}

let initPromise: Promise<void> | null = null;

export async function ensureDatabaseReady() {
  if (!databaseEnabled) {
    throw new Error("Database is not configured");
  }
  if (!initPromise) {
    initPromise = initializeDatabase().catch((error) => {
      initPromise = null;
      throw error;
    });
  }
  return initPromise;
}

// Create a connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
});

export const db = drizzle(pool, { schema });

// Handle connection errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

/**
 * Initialize the database schema
 * Creates the early_access_emails table if it doesn't exist
 */
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create table
    await client.query(`
      CREATE TABLE IF NOT EXISTS early_access_emails (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on email for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_early_access_emails_email 
      ON early_access_emails(email)
    `);

    console.log("Database schema initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database schema:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Add an email to the early access list
 */
export async function addEarlyAccessEmail(email: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `INSERT INTO early_access_emails (email) VALUES ($1) RETURNING id`,
      [email.toLowerCase().trim()]
    );
    return result.rows.length > 0;
  } catch (error: any) {
    // Check if it's a unique constraint violation (email already exists)
    if (error.code === "23505") {
      console.log(`Email already exists: ${email}`);
      return false;
    }
    console.error("Error adding email to database:", error);
    throw error;
  }
}

/**
 * Check if an email exists in the early access list
 */
export async function emailExists(email: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT id FROM early_access_emails WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
}

/**
 * Get all early access emails (for admin purposes)
 */
export async function getAllEarlyAccessEmails(): Promise<string[]> {
  try {
    const result = await pool.query(
      `SELECT email FROM early_access_emails ORDER BY created_at DESC`
    );
    return result.rows.map((row) => row.email);
  } catch (error) {
    console.error("Error fetching emails:", error);
    throw error;
  }
}

/**
 * Get count of early access signups
 */
export async function getEarlyAccessCount(): Promise<number> {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM early_access_emails`
    );
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error("Error getting count:", error);
    throw error;
  }
}

/**
 * Close the database connection pool
 */
export async function closeDatabase() {
  await pool.end();
}

export default pool;
