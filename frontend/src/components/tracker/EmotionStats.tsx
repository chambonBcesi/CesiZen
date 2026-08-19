import { useMemo } from 'react';
import { EmotionLogWithEmotion } from '../../lib/api';
import { TrendingUp, Percent } from 'lucide-react';

interface EmotionStatsProps {
  logs: EmotionLogWithEmotion[];
  period: 'day' | 'week' | 'month' | 'year';
}

export default function EmotionStats({ logs, period }: EmotionStatsProps) {
  const stats = useMemo(() => {
    const emotionCounts = logs.reduce((acc, log) => {
      const key = log.emotion.name;
      if (!acc[key]) {
        acc[key] = { count: 0, emotion: log.emotion, totalIntensity: 0 };
      }
      acc[key].count++;
      acc[key].totalIntensity += log.intensity;
      return acc;
    }, {} as Record<string, { count: number; emotion: typeof logs[0]['emotion']; totalIntensity: number }>);

    const categoryCounts = logs.reduce((acc, log) => {
      acc[log.emotion.category] = (acc[log.emotion.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedEmotions = Object.values(emotionCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const avgIntensity = logs.length > 0
      ? logs.reduce((sum, log) => sum + log.intensity, 0) / logs.length
      : 0;

    return { emotionCounts: sortedEmotions, categoryCounts, totalLogs: logs.length, avgIntensity };
  }, [logs]);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = { positive: 'Positives', negative: 'Négatives', neutral: 'Neutres' };
    return labels[category] || category;
  };

  const getPeriodLabel = () => {
    const labels = { day: "aujourd'hui", week: 'cette semaine', month: 'ce mois', year: 'cette année' };
    return labels[period];
  };

  if (stats.totalLogs === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
        <p className="text-gray-600">Aucune donnée disponible pour {getPeriodLabel()}.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-teal-600" />
        Statistiques - {getPeriodLabel()}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Entrées totales</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalLogs}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Intensité moyenne</p>
          <p className="text-3xl font-bold text-gray-900">{stats.avgIntensity.toFixed(1)}/5</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Émotions les plus fréquentes</h4>
        <div className="space-y-3">
          {stats.emotionCounts.map(({ emotion, count, totalIntensity }) => {
            const percentage = (count / stats.totalLogs) * 100;
            const avgIntensity = totalIntensity / count;
            return (
              <div key={emotion.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{emotion.emoji}</span>
                    <span className="text-sm font-medium text-gray-900">{emotion.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{count}x</span>
                    <span className="flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      {percentage.toFixed(0)}%
                    </span>
                    <span>{avgIntensity.toFixed(1)}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%`, backgroundColor: emotion.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Répartition par catégorie</h4>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(stats.categoryCounts).map(([category, count]) => {
            const percentage = (count / stats.totalLogs) * 100;
            const colors: Record<string, string> = { positive: '#10B981', negative: '#EF4444', neutral: '#6B7280' };
            return (
              <div key={category} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: colors[category] }}>
                  {percentage.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-600 mt-1">{getCategoryLabel(category)}</p>
                <p className="text-xs text-gray-500">{count} entrées</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
