import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in environment variables');
  process.exit(1);
}

import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import favoriteRoutes from './routes/favorites.js';
import inquiryRoutes from './routes/inquiries.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import agentRoutes from './routes/agents.js';
import reviewRoutes from './routes/reviews.js';
import notificationRoutes from './routes/notifications.js';
import blogRoutes from './routes/blog.js';
import { authenticate, adminOnly } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Too many payment attempts, please try again later.' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/payments', paymentLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', authenticate, favoriteRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', authenticate, notificationRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', authenticate, adminOnly, adminRoutes);

app.get('/api/cities', async (req, res) => {
  try {
    const { default: pool } = await import('./db/pool.js');
    const result = await pool.query(
      'SELECT DISTINCT city FROM properties WHERE status = $1 ORDER BY city', ['active']
    );
    res.json(result.rows.map(r => r.city));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
