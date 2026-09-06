const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'jarvis_stark_industries_quantum_key_987654321_secure';

// Zod Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address format"),
  password: z.string().min(1, "Password is required")
});

// Register New User
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists in system database.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'operator'
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Audit log entry
    await prisma.auditLog.create({
      data: {
        action: 'USER_REGISTERED',
        details: `User registered: ${user.email}`,
        ipAddress: req.ip
      }
    });

    res.status(201).json({
      message: 'Operator authorization granted.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Internal system error during authorization.' });
  }
});

// Login Existing User
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid identification credentials.' });
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid identification credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await prisma.auditLog.create({
      data: {
        action: 'USER_LOGIN',
        details: `Operator logged in: ${user.email}`,
        ipAddress: req.ip
      }
    });

    res.json({
      message: 'Clearance accepted. Welcome back, Boss.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal authentication server error.' });
  }
});

// Get Current User Profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve operator profile.' });
  }
});

module.exports = router;
