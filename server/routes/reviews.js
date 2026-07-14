import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/property/:propertyId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name, u.avatar AS user_avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.property_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.propertyId]
    );
    const avgResult = await pool.query(
      'SELECT AVG(rating)::NUMERIC(2,1) AS avg_rating, COUNT(*) AS total FROM reviews WHERE property_id = $1',
      [req.params.propertyId]
    );
    res.json({
      reviews: result.rows,
      avg_rating: parseFloat(avgResult.rows[0].avg_rating) || 0,
      total: parseInt(avgResult.rows[0].total),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticate, [
  body('property_id').isInt().withMessage('Property ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { property_id, rating, comment } = req.body;
    const existing = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND property_id = $2',
      [req.user.id, property_id]
    );
    if (existing.rows.length) {
      return res.status(400).json({ message: 'You have already reviewed this property' });
    }
    const result = await pool.query(
      'INSERT INTO reviews (property_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [property_id, req.user.id, rating, comment || null]
    );

    const propResult = await pool.query('SELECT user_id FROM properties WHERE id = $1', [property_id]);
    if (propResult.rows.length && propResult.rows[0].user_id !== req.user.id) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, message, link)
         VALUES ($1, 'review', $2, $3)`,
        [
          propResult.rows[0].user_id,
          `${req.user.name} left a ${rating}-star review on your property.`,
          `/properties/${property_id}`,
        ]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Review not found' });
    if (result.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
