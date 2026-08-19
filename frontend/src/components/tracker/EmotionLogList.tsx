import { EmotionLogWithEmotion } from '../../lib/api';
import { Calendar, CreditCard as Edit, Trash2 } from 'lucide-react';

interface EmotionLogListProps {
  logs: EmotionLogWithEmotion[];
  onEdit: (log: EmotionLogWithEmotion) => void;
  onDelete: (id: string) => void;
}

export default function EmotionLogList({ logs, onEdit, onDelete }: EmotionLogListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entrée</h3>
        <p className="text-gray-600">Commencez à suivre vos émotions en ajoutant une nouvelle entrée.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div
          key={log.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="text-4xl">{log.emotion.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{log.emotion.name}</h3>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: `${log.emotion.color}20`,
                      color: log.emotion.color,
                    }}
                  >
                    {log.emotion.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(log.logged_at)}</span>
                  </div>
                  <div>
                    Intensité : <span className="font-medium">{log.intensity}/5</span>
                  </div>
                </div>
                {log.note && (
                  <p className="text-gray-700 mt-2 text-sm leading-relaxed">{log.note}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(log)}
                className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                title="Modifier"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
                    onDelete(log.id);
                  }
                }}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Supprimer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
