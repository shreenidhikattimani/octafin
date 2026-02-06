import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import portfolioRoutes from './routes/portfolioRoutes';
import { fetchPortfolioLogic } from './controllers/portfolioController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api', portfolioRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const REFRESH_RATE = 5000; 

const startBroadcasting = () => {
  const loop = async () => {
    try {
      const activeClients = io.engine.clientsCount;
      
      if (activeClients > 0) {
        const data = await fetchPortfolioLogic();
        io.emit('portfolio_update', data); 
      }
    } catch (err) {
      console.error("Broadcasting failed:", err);
    } finally {
      setTimeout(loop, REFRESH_RATE);
    }
  };

  loop();
};

startBroadcasting();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  fetchPortfolioLogic().then(data => {
    socket.emit('portfolio_update', data);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});