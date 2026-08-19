import { useState } from 'react';
import { Emotion } from '../../lib/api';
import { X } from 'lucide-react';

interface EmotionLogFormProps {
  emotions: Emotion[];
  onSubmit: (data: { emotionId: string; intensity: number; note: string; loggedAt: string }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    emotionId: string;
    intensity: number;
    note: string;
    loggedAt: string;
  };
}

export default function EmotionLogForm({ emotions, onSubmit, onCancel, initialData }: EmotionLogFormProps) {
  const [emotionId, setEmotionId] = useState(initialData?.emotionId || '');
  const [intensity, setIntensity] = useState(initialData?.intensity || 3);
  const [note, setNote] = useState(initialData?.note || '');
  const [loggedAt, setLoggedAt] = useState(
    initialData?.loggedAt || new Date().toISOString().slice(0, 16)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_NOTE_LENGTH = 2000;

  const emotionsByLevel = emotions.reduce((acc, emotion) => {
    if (!acc[emotion.level]) acc[emotion.level] = [];
    acc[emotion.level].push(emotion);
    return acc;
  }, {} as Record<number, Emotion[]>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emotionId) {
      setError('Veuillez sélectionner une émotion.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        emotionId,
        intensity,
        note,
        loggedAt: new Date(loggedAt).toISOString(),
      });
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de l'entrée :", err);
      setError("Erreur lors de l'enregistrement. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? "Modifier l'entrée" : 'Nouvelle entrée émotionnelle'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Émotion ressentie
            </label>
            <div className="space-y-4">
              {Object.entries(emotionsByLevel).map(([level, levelEmotions]) => (
                <div key={level}>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Niveau {level}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {levelEmotions.map((emotion) => (
                      <button
                        key={emotion.id}
                        type="button"
                        onClick={() => { setEmotionId(emotion.id); setError(''); }}
                        className={`p-4 rounded-lg border-2 transition ${
                          emotionId === emotion.id
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-1">{emotion.emoji}</div>
                        <div className="text-sm font-medium text-gray-900">{emotion.name}</div>
                        <div
                          className="text-xs mt-1 px-2 py-1 rounded-full inline-block"
                          style={{ backgroundColor: `${emotion.color}20`, color: emotion.color }}
                        >
                          {emotion.category}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 mb-2">
              Intensité : {intensity}/5
            </label>
            <input
              id="intensity"
              type="range"
              min="1"
              max="5"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Faible</span>
              <span>Forte</span>
            </div>
          </div>

          <div>
            <label htmlFor="loggedAt" className="block text-sm font-medium text-gray-700 mb-2">
              Date et heure
            </label>
            <input
              id="loggedAt"
              type="datetime-local"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
              Note (optionnel)
            </label>
            <textarea
              id="note"
              value={note}
              maxLength={MAX_NOTE_LENGTH}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
              placeholder="Ajoutez des détails sur ce que vous ressentez..."
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {note.length} / {MAX_NOTE_LENGTH}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!emotionId || loading}
              className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
