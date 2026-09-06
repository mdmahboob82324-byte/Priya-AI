const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jarvisEngine = require('../services/jarvisEngine');
const { verifyToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// Get System Diagnostic Telemetry
router.get('/telemetry', (req, res) => {
  try {
    const telemetry = jarvisEngine.getSystemTelemetry();
    res.json(telemetry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract system telemetry.' });
  }
});

// Process Chat / AI Command & Store in Database
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Prompt message is required.' });
    }

    const operatorName = req.user ? req.user.name : 'Boss';

    // 1. Get existing or create new session in Prisma SQLite
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    }
    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId: req.user ? req.user.id : null,
          title: `Jarvis Command Session (${new Date().toLocaleTimeString()})`
        }
      });
    }

    // 2. Save user message to database
    await prisma.message.create({
      data: {
        sessionId: session.id,
        sender: 'user',
        text: message
      }
    });

    // 3. Process with Jarvis AI Engine
    const result = await jarvisEngine.processCommand(message, operatorName);

    // 4. Save Jarvis reply to database
    const jarvisMessage = await prisma.message.create({
      data: {
        sessionId: session.id,
        sender: 'jarvis',
        text: result.reply
      }
    });

    res.json({
      sessionId: session.id,
      userMessage: message,
      jarvisReply: result.reply,
      intent: result.intent,
      telemetry: result.telemetry || null,
      timestamp: jarvisMessage.createdAt
    });
  } catch (err) {
    console.error('Chat API Error:', err);
    res.status(500).json({ error: 'Jarvis core processing failed.' });
  }
});

// Retrieve Chat History from SQLite
router.get('/history', async (req, res) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load command history.' });
  }
});

// Retrieve Security Audit Logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 20,
      orderBy: { timestamp: 'desc' }
    });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
});

module.exports = router;
