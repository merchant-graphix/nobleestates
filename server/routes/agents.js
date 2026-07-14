import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar, u.created_at,
        (SELECT COUNT(*) FROM properties WHERE user_id = u.id AND status = 'active') AS active_listings
       FROM users u
       WHERE u.role = 'agent'
       ORDER BY u.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const agentResult = await pool.query(
      `SELECT id, name, email, phone, avatar, created_at FROM users WHERE id = $1 AND role = 'agent'`,
      [req.params.id]
    );
    if (!agentResult.rows.length) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const propertiesResult = await pool.query(
      `SELECT p.*,
        (SELECT url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) AS primary_image
       FROM properties p
       WHERE p.user_id = $1 AND p.status = 'active'
       ORDER BY p.created_at DESC`,
      [req.params.id]
    );

    res.json({
      ...agentResult.rows[0],
      properties: propertiesResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
