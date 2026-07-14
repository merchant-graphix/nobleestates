import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import { authenticate, agentOrAdmin, optionalAuth } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    const optimizedPath = filePath.replace(/(\.\w+)$/, '_opt$1');
    try {
      await sharp(filePath)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(optimizedPath);
      fs.unlinkSync(filePath);
      fs.renameSync(optimizedPath, filePath);
    } catch {
    }
  }
}

router.get('/batch', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ message: 'ids parameter is required' });
    const idList = ids.split(',').map(Number).filter(n => !isNaN(n));
    if (!idList.length) return res.status(400).json({ message: 'No valid IDs provided' });
    const result = await pool.query(
      `SELECT p.*,
        (SELECT json_agg(json_build_object('id', pi.id, 'url', pi.url, 'is_primary', pi.is_primary))
         FROM property_images pi WHERE pi.property_id = p.id) AS images,
        (SELECT url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) AS primary_image
       FROM properties p WHERE p.id = ANY($1)`,
      [idList]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [props, agents, buyers] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM properties WHERE status = 'active'"),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'agent'"),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'"),
    ]);
    res.json({
      properties: parseInt(props.rows[0].count),
      agents: parseInt(agents.rows[0].count),
      clients: parseInt(buyers.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search, city, type, minPrice, maxPrice,
      bedrooms, status, page = 1, limit = 12, sort = 'newest',
    } = req.query;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(p.title ILIKE $${idx} OR p.description ILIKE $${idx} OR p.city ILIKE $${idx} OR p.address ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (city) {
      conditions.push(`p.city ILIKE $${idx}`);
      params.push(city);
      idx++;
    }
    if (type) {
      conditions.push(`p.type = $${idx}`);
      params.push(type);
      idx++;
    }
    if (minPrice) {
      conditions.push(`p.price >= $${idx}`);
      params.push(minPrice);
      idx++;
    }
    if (maxPrice) {
      conditions.push(`p.price <= $${idx}`);
      params.push(maxPrice);
      idx++;
    }
    if (bedrooms) {
      conditions.push(`p.bedrooms = $${idx}`);
      params.push(parseInt(bedrooms));
      idx++;
    }
    conditions.push(`p.status = $${idx}`);
    params.push(status || 'active');
    idx++;

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const orderMap = {
      newest: 'p.created_at DESC',
      oldest: 'p.created_at ASC',
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      area_asc: 'p.area_sqft ASC',
      area_desc: 'p.area_sqft DESC',
    };
    const orderBy = orderMap[sort] || 'p.created_at DESC';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM properties p ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT p.*,
        (SELECT json_agg(json_build_object('id', pi.id, 'url', pi.url, 'is_primary', pi.is_primary))
         FROM property_images pi WHERE pi.property_id = p.id) AS images,
        (SELECT url FROM property_images WHERE property_id = p.id AND is_primary = TRUE LIMIT 1) AS primary_image
       FROM properties p ${where}
       ORDER BY ${orderBy}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      properties: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*,
        u.name AS agent_name, u.email AS agent_email, u.phone AS agent_phone, u.avatar AS agent_avatar, u.id AS agent_id,
        (SELECT json_agg(json_build_object('id', pi.id, 'url', pi.url, 'is_primary', pi.is_primary) ORDER BY pi.is_primary DESC, pi.id)
         FROM property_images pi WHERE pi.property_id = p.id) AS images
       FROM properties p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await pool.query('UPDATE properties SET views_count = views_count + 1 WHERE id = $1', [req.params.id]);

    const property = result.rows[0];

    let is_favorite = false;
    if (req.user) {
      const fav = await pool.query(
        'SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2',
        [req.user.id, req.params.id]
      );
      is_favorite = fav.rows.length > 0;
    }

    res.json({ ...property, is_favorite, views_count: (property.views_count || 0) + 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticate, agentOrAdmin, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Valid price is required'),
  body('type').isIn(['buy', 'rent']).withMessage('Type must be buy or rent'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
  body('area_sqft').isInt({ min: 1 }).withMessage('Area must be at least 1 sqm'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('Region is required'),
  body('zip').optional({ values: 'falsy' }).trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { title, description, price, type, bedrooms, bathrooms, area_sqft, address, city, state, zip, lat, lng, status } = req.body;
    const result = await pool.query(
      `INSERT INTO properties (user_id, title, description, price, type, status, bedrooms, bathrooms, area_sqft, address, city, state, zip, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [req.user.id, title, description, price, type, status || 'active', bedrooms, bathrooms, area_sqft, address, city, state, zip || '', lat || null, lng || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticate, agentOrAdmin, [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isNumeric().withMessage('Valid price is required'),
  body('type').optional().isIn(['buy', 'rent']).withMessage('Type must be buy or rent'),
  body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
  body('area_sqft').optional().isInt({ min: 1 }).withMessage('Area must be at least 1 sqm'),
  body('status').optional().isIn(['active', 'sold', 'rented']).withMessage('Invalid status'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const existing = await pool.query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (req.user.role !== 'admin' && existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, description, price, type, status, bedrooms, bathrooms, area_sqft, address, city, state, zip, lat, lng } = req.body;
    const result = await pool.query(
      `UPDATE properties SET
        title = COALESCE($1, title), description = COALESCE($2, description),
        price = COALESCE($3, price), type = COALESCE($4, type),
        status = COALESCE($5, status), bedrooms = COALESCE($6, bedrooms),
        bathrooms = COALESCE($7, bathrooms), area_sqft = COALESCE($8, area_sqft),
        address = COALESCE($9, address), city = COALESCE($10, city),
        state = COALESCE($11, state), zip = COALESCE($12, zip),
        lat = COALESCE($13, lat), lng = COALESCE($14, lng),
        updated_at = NOW()
       WHERE id = $15 RETURNING *`,
      [title, description, price, type, status, bedrooms, bathrooms, area_sqft, address, city, state, zip, lat, lng, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/images', authenticate, agentOrAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (req.user.role !== 'admin' && existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const files = req.files;
    if (!files || !files.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const checkPrimary = await pool.query(
      'SELECT id FROM property_images WHERE property_id = $1 AND is_primary = TRUE LIMIT 1',
      [req.params.id]
    );
    const hasPrimary = checkPrimary.rows.length > 0;

    const images = [];
    for (let i = 0; i < files.length; i++) {
      await optimizeImage(files[i].path);
      const isPrimary = !hasPrimary && i === 0;
      const result = await pool.query(
        'INSERT INTO property_images (property_id, url, is_primary) VALUES ($1, $2, $3) RETURNING *',
        [req.params.id, `/uploads/${files[i].filename}`, isPrimary]
      );
      images.push(result.rows[0]);
    }
    res.status(201).json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/images/:imageId', authenticate, agentOrAdmin, async (req, res) => {
  try {
    const img = await pool.query(
      'SELECT pi.*, p.user_id FROM property_images pi JOIN properties p ON pi.property_id = p.id WHERE pi.id = $1',
      [req.params.imageId]
    );
    if (!img.rows.length) return res.status(404).json({ message: 'Image not found' });
    if (req.user.role !== 'admin' && img.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await pool.query('DELETE FROM property_images WHERE id = $1', [req.params.imageId]);
    res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticate, agentOrAdmin, async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (req.user.role !== 'admin' && existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await pool.query('DELETE FROM properties WHERE id = $1', [req.params.id]);
    res.json({ message: 'Property deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
