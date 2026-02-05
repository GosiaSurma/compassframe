import { Pool, PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../../../shared/schema";

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
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

    // Create game_sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        role TEXT NOT NULL,
        shadow_id TEXT,
        shadow_custom TEXT,
        companion_id TEXT,
        artifact_type TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        turn INTEGER NOT NULL DEFAULT 1,
        cycle INTEGER NOT NULL DEFAULT 1,
        accumulated_scores JSONB,
        mi_metrics JSONB,
        encounter_state JSONB,
        artifact_draft JSONB,
        spell JSONB,
        opening_question TEXT,
        crystallized_essence_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create game_messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_messages (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES game_sessions(id),
        cycle INTEGER NOT NULL DEFAULT 1,
        turn INTEGER NOT NULL,
        mode TEXT NOT NULL,
        user_text TEXT,
        assistant_text TEXT,
        highlights JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create relays table
    await client.query(`
      CREATE TABLE IF NOT EXISTS relays (
        id SERIAL PRIMARY KEY,
        from_user_id VARCHAR(255) NOT NULL,
        to_user_id VARCHAR(255),
        from_role TEXT NOT NULL,
        type TEXT NOT NULL,
        text TEXT NOT NULL,
        shadow_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP
      )
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
