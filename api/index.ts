// Server code moved to api/server for Vercel bundling
import { createServer } from "./server/index";
import serverless from "serverless-http";

const app = createServer();

export default serverless(app);
