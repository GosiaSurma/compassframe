import { createServer } from "../server/index.ts";
import serverless from "serverless-http";

const app = createServer();

export default serverless(app);
