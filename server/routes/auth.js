import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/email.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const resetTokens = new Map();

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype));
  },
});

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, email, password, role } = req.body;
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const allowedRoles = ['user', 'agent'];
    const userRole = allowedRoles.includes(role) ? role : 'user';
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, phone, avatar, created_at`,
      [name, email, password_hash, userRole]
    );
    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!result.rows.length) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password_hash, ...safe } = user;
    res.json({ user: safe, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email } = req.body;
    const result = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email]);

    if (result.rows.length) {
      const user = result.rows[0];
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = Date.now() + 60 * 60 * 1000;
      resetTokens.set(resetToken, { userId: user.id, expires });

      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetToken,
      });
    }

    res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { token, password } = req.body;
    const tokenData = resetTokens.get(token);

    if (!tokenData || tokenData.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    resetTokens.delete(token);

    const password_hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, tokenData.userId]);

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', authenticate, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('bio').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, phone, bio } = req.body;
    const result = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name), phone = COALESCE($2, phone), bio = COALESCE($3, bio)
       WHERE id = $4 RETURNING id, name, email, role, phone, avatar, bio, email_verified, created_at`,
      [name, phone, bio, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/avatar', authenticate, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const avatarUrl = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [avatarUrl, req.user.id]);
    res.json({ avatar: avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/send-verification', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT email, name, email_verified FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
    if (result.rows[0].email_verified) return res.json({ message: 'Email already verified' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 24 * 60 * 60 * 1000;
    await pool.query(
      'INSERT INTO verification_tokens (user_id, token, expires_at) VALUES ($1, $2, TO_TIMESTAMP($3))',
      [req.user.id, token, expires / 1000]
    );
    await sendVerificationEmail({
      email: result.rows[0].email,
      name: result.rows[0].name,
      token,
    });
    res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/verify-email/:token', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id FROM verification_tokens WHERE token = $1 AND expires_at > NOW()',
      [req.params.token]
    );
    if (!result.rows.length) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    await pool.query('UPDATE users SET email_verified = TRUE WHERE id = $1', [result.rows[0].user_id]);
    await pool.query('DELETE FROM verification_tokens WHERE token = $1', [req.params.token]);
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
