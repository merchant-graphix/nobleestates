import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    const unread = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = FALSE',
      [req.user.id]
    );
    res.json({
      notifications: result.rows,
      unread_count: parseInt(unread.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/read-all', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE', [req.user.id]);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
