// Server code moved to server for Vercel bundling
// Use explicit .js extension for Node ESM runtime on Vercel.
import { createServer } from "../server/index.js";
import serverless from "serverless-http";

const app = createServer();

export default serverless(app);
