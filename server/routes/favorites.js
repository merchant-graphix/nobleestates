import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id, f.created_at AS saved_at,
        p.id, p.title, p.price, p.type, p.bedrooms, p.bathrooms, p.area_sqft, p.city, p.state, p.status,
        (SELECT url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) AS primary_image
       FROM favorites f
       JOIN properties p ON f.property_id = p.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:propertyId', authenticate, [
  body('propertyId').optional().isInt(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { propertyId } = req.params;
    const existing = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2',
      [req.user.id, propertyId]
    );
    if (existing.rows.length) {
      await pool.query('DELETE FROM favorites WHERE id = $1', [existing.rows[0].id]);
      return res.json({ favorited: false });
    }
    await pool.query(
      'INSERT INTO favorites (user_id, property_id) VALUES ($1, $2)',
      [req.user.id, propertyId]
    );
    res.json({ favorited: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
