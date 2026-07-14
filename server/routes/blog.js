import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const conditions = ['published = TRUE'];
    const params = [];
    let idx = 1;
    if (category) {
      conditions.push(`category = $${idx}`);
      params.push(category);
      idx++;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await pool.query(`SELECT COUNT(*) FROM blog_posts ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT bp.*, u.name AS author_name
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       ${where}
       ORDER BY bp.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );
    res.json({
      posts: result.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bp.*, u.name AS author_name
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.slug = $1 AND bp.published = TRUE`,
      [req.params.slug]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Post not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticate, adminOnly, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('slug').trim().notEmpty().withMessage('Slug is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { title, content, slug, excerpt, category, image, published } = req.body;
    const result = await pool.query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, author_id, category, image, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, slug, excerpt || null, content, req.user.id, category || null, image || null, published || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Slug already exists' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticate, adminOnly, [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { title, slug, excerpt, content, category, image, published } = req.body;
    const result = await pool.query(
      `UPDATE blog_posts SET
        title = COALESCE($1, title), slug = COALESCE($2, slug),
        excerpt = COALESCE($3, excerpt), content = COALESCE($4, content),
        category = COALESCE($5, category), image = COALESCE($6, image),
        published = COALESCE($7, published), updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [title, slug, excerpt, content, category, image, published, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Post not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Slug already exists' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
