import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { User, Mail, Calendar, Shield, Lock, Eye, EyeOff } from 'lucide-react';

const MAX_FULL_NAME_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 8;

const ROLE_LABELS = {
  admin: 'Administrateur',
  moderator: 'Modérateur',
  user: 'Utilisateur',
} as const;

export default function Profile() {
  const { profile, user, signOut, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdMessageType, setPwdMessageType] = useState<'success' | 'error'>('success');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmed = fullName.trim();
    if (trimmed.length > MAX_FULL_NAME_LENGTH) {
      setMessageType('error');
      setMessage(`Le nom ne peut pas dépasser ${MAX_FULL_NAME_LENGTH} caractères.`);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await api.put('/api/user/profile', { fullName: trimmed });
      await refreshProfile();
      setMessageType('success');
      setMessage('Profil mis à jour avec succès');
    } catch {
      setMessageType('error');
      setMessage('Erreur lors de la mise à jour. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage('');

    if (!newPassword || !currentPassword || !confirmPassword) {
      setPwdMessageType('error');
      setPwdMessage('Tous les champs sont requis.');
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPwdMessageType('error');
      setPwdMessage(`Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessageType('error');
      setPwdMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setPwdLoading(true);
    try {
      await api.put('/api/user/password', { currentPassword, newPassword });
      setPwdMessageType('success');
      setPwdMessage('Mot de passe mis à jour avec succès.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdMessageType('error');
      setPwdMessage(err.message || 'Erreur lors de la mise à jour. Veuillez réessayer.');
    } finally {
      setPwdLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const displayEmail = profile?.email || '';
  const displayName = profile?.full_name || '';
  const displayDate = profile?.created_at || '';
  const role = profile?.role;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>

        {/* Profile info card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-teal-600" />
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="font-medium text-gray-900">{displayName || 'Non renseigné'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{displayEmail || 'Non disponible'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Membre depuis</p>
                <p className="font-medium text-gray-900">
                  {displayDate ? formatDate(displayDate) : 'Non disponible'}
                </p>
              </div>
            </div>

            {role && role !== 'user' && (
              <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-lg">
                <Shield className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm text-teal-700">Statut</p>
                  <p className="font-medium text-teal-900">{ROLE_LABELS[role]}</p>
                </div>
              </div>
            )}
          </div>

          {message && (
            <div
              className={`mb-4 p-4 rounded-lg text-sm ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                maxLength={MAX_FULL_NAME_LENGTH}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                placeholder="Prénom Nom"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {fullName.length} / {MAX_FULL_NAME_LENGTH}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
            </button>
          </form>
        </div>

        {/* Security / change password card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
              <p className="text-sm text-gray-500">Modifiez votre mot de passe</p>
            </div>
          </div>

          {pwdMessage && (
            <div
              className={`mb-4 p-4 rounded-lg text-sm ${
                pwdMessageType === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {pwdMessage}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum {MIN_PASSWORD_LENGTH} caractères</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pwdLoading ? 'Mise à jour...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>

        {/* Account actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions du compte</h2>
          <button
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                signOut();
              }
            }}
            className="w-full px-4 py-3 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
