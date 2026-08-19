import { Router } from 'express';
import pool from '../db.js';
import { isAuthenticated, isAdmin, isModeratorOrAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/users - admin only
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, full_name, role, is_blocked, created_at, updated_at
       FROM users ORDER BY created_at DESC`
    );
    res.json({ users: rows });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/admin/users/:id/role - admin only
router.put('/users/:id/role', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // SECURITY: Cannot assign admin role
    if (role === 'admin') {
      return res.status(403).json({ error: 'Interdit : impossible d\'attribuer le rôle administrateur.' });
    }

    if (!['user', 'moderator'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide.' });
    }

    // Cannot modify own role
    if (id === req.user.id) {
      return res.status(403).json({ error: 'Impossible de modifier votre propre rôle.' });
    }

    const { rows } = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2
       RETURNING id, email, full_name, role, is_blocked, created_at, updated_at`,
      [role, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/admin/users/:id/block - admin only
router.put('/users/:id/block', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(403).json({ error: 'Impossible de bloquer votre propre compte.' });
    }

    const { rows: current } = await pool.query(
      'SELECT is_blocked FROM users WHERE id = $1',
      [id]
    );

    if (current.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const newBlocked = !current[0].is_blocked;
    const { rows } = await pool.query(
      `UPDATE users SET is_blocked = $1 WHERE id = $2
       RETURNING id, email, full_name, role, is_blocked, created_at, updated_at`,
      [newBlocked, id]
    );

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Toggle block error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/admin/users/:id - admin only
router.delete('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(403).json({ error: 'Impossible de supprimer votre propre compte.' });
    }

    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    res.json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
