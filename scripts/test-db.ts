
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

async function testConnection() {
    console.log("Testing database connection...");
    console.log("URL:", process.env.DATABASE_URL?.replace(/:[^:@]*@/, ":****@")); // Hide password

    if (!process.env.DATABASE_URL) {
        console.error("ERROR: DATABASE_URL is not defined.");
        return;
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

    try {
        const client = await pool.connect();
        console.log("Successfully connected to database!");

        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables found:", res.rows.map(r => r.table_name));

        client.release();
    } catch (err) {
        console.error("Connection failed:", err);
    } finally {
        await pool.end();
    }
}

testConnection();
