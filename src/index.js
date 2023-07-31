import cors from 'cors';
import express from 'express';
import http from 'http';
import { connectToDatabase } from './config/database.js';
import { connectToSocket } from './config/socket.js';
import initRoutes from './routes/index.js';
import { env, variables } from './utils/env.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Socket
const server = http.createServer(app);
const io = connectToSocket(server);
export { io };

// Routes
initRoutes(app);

// Database
const URI = env(variables.mongoUri);
await connectToDatabase(URI);

// Server listening
const PORT = env(variables.port) || 4000;
server.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
