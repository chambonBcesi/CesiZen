import { Router } from 'express';
import pool from '../db.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = Router();

// GET /api/logs - get user's emotion logs
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT el.*,
              json_build_object(
                'id', e.id,
                'name', e.name,
                'category', e.category,
                'level', e.level,
                'emoji', e.emoji,
                'color', e.color,
                'created_at', e.created_at,
                'updated_at', e.updated_at
              ) AS emotion
       FROM emotion_logs el
       JOIN emotions e ON el.emotion_id = e.id
       WHERE el.user_id = $1
       ORDER BY el.logged_at DESC`,
      [req.user.id]
    );
    res.json({ logs: rows });
  } catch (err) {
    console.error('List logs error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/logs
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { emotionId, intensity, note, loggedAt } = req.body;

    if (!emotionId) {
      return res.status(400).json({ error: 'Émotion requise.' });
    }

    const intensityClamped = Math.max(1, Math.min(5, parseInt(intensity, 10) || 3));

    const { rows } = await pool.query(
      `INSERT INTO emotion_logs (user_id, emotion_id, intensity, note, logged_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.user.id,
        emotionId,
        intensityClamped,
        note ? note.slice(0, 2000) : null,
        loggedAt || new Date().toISOString(),
      ]
    );

    // Fetch with emotion joined
    const { rows: full } = await pool.query(
      `SELECT el.*,
              json_build_object(
                'id', e.id,
                'name', e.name,
                'category', e.category,
                'level', e.level,
                'emoji', e.emoji,
                'color', e.color,
                'created_at', e.created_at,
                'updated_at', e.updated_at
              ) AS emotion
       FROM emotion_logs el
       JOIN emotions e ON el.emotion_id = e.id
       WHERE el.id = $1`,
      [rows[0].id]
    );

    res.status(201).json({ log: full[0] });
  } catch (err) {
    console.error('Create log error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/logs/:id
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { emotionId, intensity, note, loggedAt } = req.body;

    const intensityClamped = Math.max(1, Math.min(5, parseInt(intensity, 10) || 3));

    const { rows } = await pool.query(
      `UPDATE emotion_logs
       SET emotion_id = $1, intensity = $2, note = $3, logged_at = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [
        emotionId,
        intensityClamped,
        note ? note.slice(0, 2000) : null,
        loggedAt || new Date().toISOString(),
        id,
        req.user.id,
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Entrée introuvable.' });
    }

    // Fetch with emotion joined
    const { rows: full } = await pool.query(
      `SELECT el.*,
              json_build_object(
                'id', e.id,
                'name', e.name,
                'category', e.category,
                'level', e.level,
                'emoji', e.emoji,
                'color', e.color,
                'created_at', e.created_at,
                'updated_at', e.updated_at
              ) AS emotion
       FROM emotion_logs el
       JOIN emotions e ON el.emotion_id = e.id
       WHERE el.id = $1`,
      [rows[0].id]
    );

    res.json({ log: full[0] });
  } catch (err) {
    console.error('Update log error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/logs/:id
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      'DELETE FROM emotion_logs WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Entrée introuvable.' });
    }

    res.json({ message: 'Entrée supprimée.' });
  } catch (err) {
    console.error('Delete log error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
