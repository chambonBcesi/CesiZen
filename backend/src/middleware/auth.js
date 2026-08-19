import jwt from 'jsonwebtoken';
import pool from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function isAuthenticated(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou invalide.' });
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token expiré ou invalide.' });
  }
}

export async function isAdmin(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT role, is_blocked FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Utilisateur introuvable.' });
    }
    if (rows[0].is_blocked) {
      return res.status(403).json({ error: 'Compte suspendu.' });
    }
    if (rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    }
    next();
  } catch (err) {
    console.error('isAdmin middleware error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function isModeratorOrAdmin(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT role, is_blocked FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Utilisateur introuvable.' });
    }
    if (rows[0].is_blocked) {
      return res.status(403).json({ error: 'Compte suspendu.' });
    }
    if (rows[0].role !== 'admin' && rows[0].role !== 'moderator') {
      return res.status(403).json({ error: 'Accès réservé aux modérateurs et administrateurs.' });
    }
    req.userRole = rows[0].role;
    next();
  } catch (err) {
    console.error('isModeratorOrAdmin middleware error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
