import { useState, useEffect } from 'react';
import { api, Emotion, EmotionLogWithEmotion } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import EmotionLogForm from '../components/tracker/EmotionLogForm';
import EmotionLogList from '../components/tracker/EmotionLogList';
import EmotionStats from '../components/tracker/EmotionStats';
import { Plus, ListFilter as Filter } from 'lucide-react';

type Period = 'day' | 'week' | 'month' | 'year';

export default function Tracker() {
  const { user } = useAuth();
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [logs, setLogs] = useState<EmotionLogWithEmotion[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<EmotionLogWithEmotion[]>([]);
  const [period, setPeriod] = useState<Period>('week');
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<EmotionLogWithEmotion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadEmotions();
      loadLogs();
    }
  }, [user]);

  useEffect(() => {
    filterLogsByPeriod();
  }, [logs, period]);

  const loadEmotions = async () => {
    try {
      const data = await api.get<{ emotions: Emotion[] }>('/api/emotions');
      setEmotions(data.emotions);
    } catch (err) {
      console.error('Erreur lors du chargement des émotions :', err);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ logs: EmotionLogWithEmotion[] }>('/api/logs');
      setLogs(data.logs);
    } catch (err) {
      console.error('Erreur lors du chargement des entrées :', err);
    }
    setLoading(false);
  };

  const filterLogsByPeriod = () => {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const filtered = logs.filter((log) => new Date(log.logged_at) >= startDate);
    setFilteredLogs(filtered);
  };

  const handleCreateLog = async (data: {
    emotionId: string;
    intensity: number;
    note: string;
    loggedAt: string;
  }) => {
    await api.post('/api/logs', {
      emotionId: data.emotionId,
      intensity: data.intensity,
      note: data.note || null,
      loggedAt: data.loggedAt,
    });
    await loadLogs();
    setShowForm(false);
  };

  const handleUpdateLog = async (data: {
    emotionId: string;
    intensity: number;
    note: string;
    loggedAt: string;
  }) => {
    if (!editingLog) return;
    await api.put(`/api/logs/${editingLog.id}`, {
      emotionId: data.emotionId,
      intensity: data.intensity,
      note: data.note || null,
      loggedAt: data.loggedAt,
    });
    await loadLogs();
    setEditingLog(null);
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await api.delete(`/api/logs/${id}`);
      await loadLogs();
    } catch (err) {
      console.error("Erreur lors de la suppression de l'entrée :", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Suivi des Émotions</h1>
          <p className="text-gray-600">Suivez et analysez vos émotions au quotidien</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Période :</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { value: 'day', label: 'Jour' },
                    { value: 'week', label: 'Semaine' },
                    { value: 'month', label: 'Mois' },
                    { value: 'year', label: 'Année' },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPeriod(p.value as Period)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        period === p.value
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouvelle entrée émotionnelle
              </button>
            </div>

            <EmotionLogList
              logs={filteredLogs}
              onEdit={(log) => setEditingLog(log)}
              onDelete={handleDeleteLog}
            />
          </div>

          <div className="lg:col-span-1">
            <EmotionStats logs={filteredLogs} period={period} />
          </div>
        </div>
      </div>

      {showForm && (
        <EmotionLogForm
          emotions={emotions}
          onSubmit={handleCreateLog}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingLog && (
        <EmotionLogForm
          emotions={emotions}
          onSubmit={handleUpdateLog}
          onCancel={() => setEditingLog(null)}
          initialData={{
            emotionId: editingLog.emotion_id,
            intensity: editingLog.intensity,
            note: editingLog.note || '',
            loggedAt: new Date(editingLog.logged_at).toISOString().slice(0, 16),
          }}
        />
      )}
    </div>
  );
}
