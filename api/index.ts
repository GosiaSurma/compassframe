// Server code moved to api/_server for Vercel bundling
import { createServer } from "./_server/index";
import serverless from "serverless-http";

const app = createServer();

export default serverless(app);
