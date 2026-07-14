import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db/pool.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { sendInquiryEmail } from '../utils/email.js';

const router = express.Router();

router.post('/', optionalAuth, [
  body('property_id').isInt().withMessage('Valid property ID is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { property_id, name, email, phone, message } = req.body;

    const propResult = await pool.query(
      `SELECT p.title, u.name AS agent_name, u.email AS agent_email
       FROM properties p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [property_id]
    );

    const result = await pool.query(
      `INSERT INTO inquiries (property_id, user_id, name, email, phone, message)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [property_id, req.user?.id || null, name, email, phone || null, message]
    );

    if (propResult.rows.length && propResult.rows[0].agent_email) {
      const prop = propResult.rows[0];
      sendInquiryEmail({
        agentEmail: prop.agent_email,
        agentName: prop.agent_name,
        buyerName: name,
        buyerEmail: email,
        buyerPhone: phone,
        propertyTitle: prop.title,
        message,
      }).catch(() => {});
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
