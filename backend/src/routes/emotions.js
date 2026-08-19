import { Router } from 'express';
import pool from '../db.js';
import { isAuthenticated, isModeratorOrAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/emotions - authenticated users
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM emotions ORDER BY level ASC, name ASC'
    );
    res.json({ emotions: rows });
  } catch (err) {
    console.error('List emotions error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/emotions - moderator/admin
router.post('/', isAuthenticated, isModeratorOrAdmin, async (req, res) => {
  try {
    const { name, category, level, emoji, color } = req.body;

    if (!name || !emoji) {
      return res.status(400).json({ error: 'Nom et emoji requis.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO emotions (name, category, level, emoji, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name.trim().slice(0, 50),
        category || 'neutral',
        level || 1,
        emoji.slice(0, 4),
        color || '#6B7280',
      ]
    );

    res.status(201).json({ emotion: rows[0] });
  } catch (err) {
    console.error('Create emotion error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/emotions/:id - moderator/admin
router.put('/:id', isAuthenticated, isModeratorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, level, emoji, color } = req.body;

    const { rows } = await pool.query(
      `UPDATE emotions SET name = $1, category = $2, level = $3, emoji = $4, color = $5
       WHERE id = $6
       RETURNING *`,
      [
        (name || '').trim().slice(0, 50),
        category || 'neutral',
        level || 1,
        (emoji || '').slice(0, 4),
        color || '#6B7280',
        id,
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Émotion introuvable.' });
    }

    res.json({ emotion: rows[0] });
  } catch (err) {
    console.error('Update emotion error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/emotions/:id - moderator/admin
router.delete('/:id', isAuthenticated, isModeratorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM emotions WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Émotion introuvable.' });
    }

    res.json({ message: 'Émotion supprimée.' });
  } catch (err) {
    console.error('Delete emotion error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
