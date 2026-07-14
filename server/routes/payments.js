import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { sendPaymentConfirmationEmail } from '../utils/email.js';

const router = express.Router();

router.post('/', authenticate, [
  body('property_id').isInt().withMessage('Valid property ID is required'),
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('method').isIn(['airtel_money', 'tnm_mpamba', 'card']).withMessage('Invalid payment method'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { property_id, amount, method, phone } = req.body;

    const prop = await pool.query('SELECT id, price, title FROM properties WHERE id = $1 AND status = $2', [property_id, 'active']);
    if (!prop.rows.length) {
      return res.status(404).json({ message: 'Property not found or not available' });
    }

    const ref = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const result = await pool.query(
      `INSERT INTO payments (property_id, user_id, amount, method, phone, status, reference)
       VALUES ($1, $2, $3, $4, $5, 'completed', $6) RETURNING *`,
      [property_id, req.user.id, amount, method, phone || null, ref]
    );

    const userResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length) {
      const user = userResult.rows[0];
      sendPaymentConfirmationEmail({
        userEmail: user.email,
        userName: user.name,
        propertyTitle: prop.rows[0].title,
        amount,
        method,
        reference: ref,
      }).catch(() => {});
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pay.*, p.title AS property_title, p.city, p.type
       FROM payments pay
       LEFT JOIN properties p ON pay.property_id = p.id
       WHERE pay.user_id = $1
       ORDER BY pay.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/all', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const result = await pool.query(
      `SELECT pay.*, p.title AS property_title, p.city, u.name AS user_name, u.email AS user_email
       FROM payments pay
       LEFT JOIN properties p ON pay.property_id = p.id
       LEFT JOIN users u ON pay.user_id = u.id
       ORDER BY pay.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
