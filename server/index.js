require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const { helmetMiddleware, corsMiddleware, authRateLimiter, apiRateLimiter } = require('./middleware/security');
const authRoutes = require('./routes/authRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const jarvisEngine = require('./services/jarvisEngine');
const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;
// 1. Apply Security Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 2. Rate Limited Routes
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/assistant', apiRateLimiter, assistantRoutes);
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'J.A.R.V.I.S. Protocol Core',
    security: 'MAXIMUM',
    timestamp: new Date().toISOString()
  });
});
// 3. Socket.IO Real-Time WebSockets Engine
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
io.on('connection', (socket) => {
  console.log(`[Socket.IO] New HUD Client Connected: ${socket.id}`);
  // Emit initial telemetry on connection
  socket.emit('telemetry_update', jarvisEngine.getSystemTelemetry());
  // Handle Real-Time Commands over WebSocket & Persist to dev.db
  socket.on('user_command', async (data) => {
    const { prompt, operatorName = 'Boss' } = data;
    
    // 1. Set Jarvis state to THINKING
    socket.emit('state_change', { state: 'thinking' });
    try {
      // Create or find chat session in SQLite dev.db
      let session = await prisma.chatSession.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      if (!session) {  session = await prisma.chatSession.create({
          data: { title: `Real-time WebSocket Session (${new Date().toLocaleTimeString()})` }
        });
      }
      // Save User prompt to dev.db
      await prisma.message.create({
        data: { sessionId: session.id, sender: 'user', text: prompt }
      });
      // Process command with Jarvis Engine
      setTimeout(async () => {
        const result = await jarvisEngine.processCommand(prompt, operatorName);
        // Save Jarvis response to dev.db
        await prisma.message.create({
          data: { sessionId: session.id, sender: 'jarvis', text: result.reply }
        });
        // Audit Log Entry in dev.db
       await prisma.auditLog.create({
          data: {
            action: 'REALTIME_COMMAND',
            details: `Command processed: "${prompt.slice(0, 40)}..."`,
            ipAddress: socket.handshake.address
          }
        });
        // 2. Set state to SPEAKING and send response over WebSockets
        socket.emit('state_change', { state: 'speaking' });
        socket.emit('jarvis_response', {
          prompt,
          reply: result.reply,
          intent: result.intent,
          telemetry: result.telemetry || jarvisEngine.getSystemTelemetry(),
          timestamp: new Date().toISOString()
        });
        // 3. Reset state back to IDLE after speaking
        setTimeout(() => {
          socket.emit('state_change', { state: 'idle' });
        }, 3000);  }, 500);
    } catch (err) {
      console.error('[SQLite Write Error]:', err);
      socket.emit('jarvis_response', {
        prompt,
        reply: `Subsystem alert: Unable to complete command. Security protocol reset required.`,
        intent: 'ERROR',
        timestamp: new Date().toISOString()
      });
      socket.emit('state_change', { state: 'idle' });
    }
  });
  // Client requests manual telemetry refresh
  socket.on('request_telemetry', () => {
    socket.emit('telemetry_update', jarvisEngine.getSystemTelemetry());
  });
socket.on('disconnect', () => {
    console.log(`[Socket.IO] HUD Client Disconnected: ${socket.id}`);
  });
});
// Periodically stream telemetry updates to all connected clients every 4 seconds
setInterval(() => {
  io.emit('telemetry_update', jarvisEngine.getSystemTelemetry());
}, 4000);
// Initialize Server & Database
server.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`🚀 J.A.R.V.I.S. Core Server Active on Port: ${PORT}`);
  console.log(`🔒 Security Shield: Active (Helmet + RateLimiter + JWT)`);
  console.log(`⚡ WebSocket Stream: Ready (Socket.IO)`);
  console.log(`🗄️ Database Connection: SQLite via Prisma ORM`);
    console.log(`==================================================\n`);
  
  try {
    await prisma.$connect();
    console.log(`[Prisma] SQLite Database connected successfully.`);
  } catch (err) {
    console.error(`[Prisma] Database connection error:`, err);
  }
});
