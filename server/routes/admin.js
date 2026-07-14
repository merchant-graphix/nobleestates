import express from 'express';
import { body, param, validationResult } from 'express-validator';
import pool from '../db/pool.js';

const router = express.Router();

router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, phone, avatar, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id/role', [
  param('id').isInt().withMessage('Valid user ID is required'),
  body('role').isIn(['user', 'agent', 'admin']).withMessage('Invalid role'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { role } = req.body;
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/inquiries', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, p.title AS property_title
       FROM inquiries i
       LEFT JOIN properties p ON i.property_id = p.id
       ORDER BY i.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/inquiries/:id', [
  param('id').isInt().withMessage('Valid inquiry ID is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const result = await pool.query('DELETE FROM inquiries WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Inquiry not found' });
    res.json({ message: 'Inquiry deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/properties', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name AS agent_name,
        (SELECT url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) AS primary_image
       FROM properties p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
