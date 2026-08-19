import { Router } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = Router();
const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

// GET /api/user/profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, full_name, role, is_blocked, created_at, updated_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/user/profile
router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    const { fullName } = req.body;
    const trimmed = (fullName || '').trim().slice(0, 100);

    const { rows } = await pool.query(
      `UPDATE users SET full_name = $1 WHERE id = $2
       RETURNING id, email, full_name, role, is_blocked, created_at, updated_at`,
      [trimmed, req.user.id]
    );

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/user/password
router.put('/password', isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis.' });
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.` });
    }

    const { rows } = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    res.json({ message: 'Mot de passe mis à jour avec succès.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
