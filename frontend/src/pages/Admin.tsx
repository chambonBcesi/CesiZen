import { useState, useEffect, useCallback } from 'react';
import { api, Emotion, UserRole } from '../lib/api';
import { Plus, CreditCard as Edit, Trash2, Settings, Users, ShieldCheck, Ban, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

let toastId = 0;

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto max-w-sm transition-all ${
            t.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {t.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="ml-2 opacity-70 hover:opacity-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_blocked: boolean;
  created_at: string;
}

type Tab = 'emotions' | 'users';

const MAX_EMOTION_NAME_LENGTH = 50;
const MAX_EMOJI_LENGTH = 4;
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{0,6}$/;

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Utilisateur',
  moderator: 'Modérateur',
  admin: 'Administrateur',
};

const ROLE_COLORS: Record<UserRole, string> = {
  user: 'bg-gray-100 text-gray-600',
  moderator: 'bg-blue-100 text-blue-700',
  admin: 'bg-teal-100 text-teal-700',
};

interface DeleteDialogProps {
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteDialog({ userName, onConfirm, onCancel }: DeleteDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Supprimer le compte</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer définitivement le compte de{' '}
          <span className="font-semibold text-gray-900">{userName}</span> ?
          Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { profile: currentProfile } = useAuth();
  const isAdmin = currentProfile?.role === 'admin';

  const [activeTab, setActiveTab] = useState<Tab>('emotions');
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmotion, setEditingEmotion] = useState<Emotion | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    category: 'neutral' as 'positive' | 'negative' | 'neutral',
    level: 1 as 1 | 2,
    emoji: '',
    color: '#6B7280',
  });

  useEffect(() => {
    loadEmotions();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && isAdmin) loadUsers();
  }, [activeTab, isAdmin]);

  const loadEmotions = async () => {
    try {
      const data = await api.get<{ emotions: Emotion[] }>('/api/emotions');
      setEmotions(data.emotions);
    } catch (err) {
      console.error('Erreur lors du chargement des émotions :', err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.get<{ users: UserProfile[] }>('/api/admin/users');
      setUsers(data.users);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs :', err);
    }
  };

  const setUserRole = async (user: UserProfile, newRole: UserRole) => {
    if (user.id === currentProfile?.id) return;
    if (newRole === 'admin') return;
    setUpdatingUserId(user.id);
    try {
      await api.put(`/api/admin/users/${user.id}/role`, { role: newRole });
      await loadUsers();
    } catch (err) {
      addToast('Erreur lors de la modification du rôle.', 'error');
    }
    setUpdatingUserId(null);
  };

  const toggleBlockUser = async (user: UserProfile) => {
    if (user.id === currentProfile?.id) return;
    setUpdatingUserId(user.id);
    try {
      await api.put(`/api/admin/users/${user.id}/block`, {});
      await loadUsers();
    } catch (err) {
      addToast('Erreur lors de la modification.', 'error');
    }
    setUpdatingUserId(null);
  };

  const deleteUser = async (user: UserProfile) => {
    setDeleteTarget(null);
    setUpdatingUserId(user.id);
    try {
      await api.delete(`/api/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      addToast("L'utilisateur a été supprimé avec succès.", 'success');
    } catch (err) {
      addToast("Erreur lors de la suppression du compte.", 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmotion) {
        await api.put(`/api/emotions/${editingEmotion.id}`, formData);
      } else {
        await api.post('/api/emotions', formData);
      }
      await loadEmotions();
      resetForm();
    } catch (err) {
      addToast('Erreur lors de la sauvegarde.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette émotion ?')) return;
    try {
      await api.delete(`/api/emotions/${id}`);
      await loadEmotions();
    } catch (err) {
      addToast('Erreur lors de la suppression.', 'error');
    }
  };

  const handleEdit = (emotion: Emotion) => {
    setEditingEmotion(emotion);
    setFormData({ name: emotion.name, category: emotion.category, level: emotion.level, emoji: emotion.emoji, color: emotion.color });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'neutral', level: 1, emoji: '', color: '#6B7280' });
    setEditingEmotion(null);
    setShowForm(false);
  };

  const emotionsByLevel = emotions.reduce((acc, emotion) => {
    if (!acc[emotion.level]) acc[emotion.level] = [];
    acc[emotion.level].push(emotion);
    return acc;
  }, {} as Record<number, Emotion[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          </div>
          <p className="text-gray-600">
            {isAdmin
              ? "Gérez les émotions et les utilisateurs de l'application"
              : "Gérez le catalogue d'émotions de l'application"}
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit shadow-sm">
            <button
              onClick={() => setActiveTab('emotions')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'emotions' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              Émotions
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'users' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              Utilisateurs
            </button>
          </div>
        )}

        {/* Emotions Tab */}
        {(activeTab === 'emotions' || !isAdmin) && (
          <>
            <div className="mb-6">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ajouter une émotion
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {editingEmotion ? "Modifier l'émotion" : 'Nouvelle émotion'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        value={formData.name}
                        maxLength={MAX_EMOTION_NAME_LENGTH}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Ex : Joyeux"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
                      <input
                        type="text"
                        value={formData.emoji}
                        onChange={(e) => {
                          const val = e.target.value;
                          if ([...val].length <= MAX_EMOJI_LENGTH) setFormData({ ...formData, emoji: val });
                        }}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof formData.category })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="positive">Positive</option>
                        <option value="negative">Négative</option>
                        <option value="neutral">Neutre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) as 1 | 2 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value={1}>1 - Primaire</option>
                        <option value={2}>2 - Secondaire</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.color}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (HEX_COLOR_RE.test(val)) setFormData({ ...formData, color: val });
                          }}
                          maxLength={7}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
                    >
                      {editingEmotion ? 'Mettre à jour' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-6">
              {Object.entries(emotionsByLevel).map(([level, levelEmotions]) => (
                <div key={level} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Niveau {level} — {level === '1' ? 'Émotions primaires' : 'Émotions secondaires'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {levelEmotions.map((emotion) => (
                      <div key={emotion.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{emotion.emoji}</span>
                            <div>
                              <h3 className="font-semibold text-gray-900">{emotion.name}</h3>
                              <span
                                className="text-xs px-2 py-1 rounded-full inline-block mt-1"
                                style={{ backgroundColor: `${emotion.color}20`, color: emotion.color }}
                              >
                                {emotion.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleEdit(emotion)}
                            className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center justify-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(emotion.id)}
                            className="flex-1 px-3 py-2 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Users Tab — admin only */}
        {activeTab === 'users' && isAdmin && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Utilisateurs
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {users.length} compte{users.length > 1 ? 's' : ''}
                </span>
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Hiérarchie des rôles : Utilisateur &rarr; Modérateur
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {users.map((user) => {
                const isSelf = user.id === currentProfile?.id;
                const isUpdating = updatingUserId === user.id;

                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between px-6 py-4 transition ${
                      user.is_blocked ? 'bg-red-50/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        user.is_blocked ? 'bg-red-100' : 'bg-teal-100'
                      }`}>
                        <span className={`font-semibold text-sm ${user.is_blocked ? 'text-red-600' : 'text-teal-700'}`}>
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-medium ${user.is_blocked ? 'text-gray-500' : 'text-gray-900'}`}>
                            {user.full_name || 'Sans nom'}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user.role]}`}>
                            {ROLE_LABELS[user.role]}
                          </span>
                          {user.is_blocked && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                              <Ban className="w-3 h-3" />
                              Bloqué
                            </span>
                          )}
                          {isSelf && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Vous</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    {!isSelf && (
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        {user.role === 'user' && (
                          <button
                            onClick={() => setUserRole(user, 'moderator')}
                            disabled={isUpdating}
                            title="Promouvoir en Modérateur"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 transition disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ShieldCheck className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">Promouvoir</span>
                          </button>
                        )}
                        {user.role === 'moderator' && (
                          <button
                            onClick={() => setUserRole(user, 'user')}
                            disabled={isUpdating}
                            title="Rétrograder en Utilisateur"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ShieldCheck className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">Rétrograder</span>
                          </button>
                        )}

                        {/* Block / Unblock */}
                        <button
                          onClick={() => toggleBlockUser(user)}
                          disabled={isUpdating}
                          title={user.is_blocked ? 'Débloquer' : 'Bloquer'}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
                            user.is_blocked
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {isUpdating ? (
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : user.is_blocked ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">{user.is_blocked ? 'Débloquer' : 'Bloquer'}</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(user)}
                          disabled={isUpdating}
                          title="Supprimer le compte"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700 transition disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">Supprimer</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteDialog
          userName={deleteTarget.full_name || deleteTarget.email}
          onConfirm={() => deleteUser(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
