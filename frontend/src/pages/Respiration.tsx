import { useState, useEffect, useRef, useCallback } from 'react';
import { Wind, Play, Pause, X, RotateCcw, Volume2, VolumeX, ChevronLeft, CircleCheck as CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type Phase = 'inhale' | 'exhale';
type Screen = 'config' | 'exercise' | 'complete';

const DURATION_OPTIONS = [
  { label: '3 minutes', value: 3 },
  { label: '5 minutes', value: 5 },
  { label: '10 minutes', value: 10 },
];

const PHASE_DURATION = 5; // seconds per phase

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Respiration() {
  const [screen, setScreen] = useState<Screen>('config');
  const [durationMin, setDurationMin] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Exercise state
  const [phase, setPhase] = useState<Phase>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0); // 0–1
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const totalSeconds = durationMin * 60;

  const playTone = useCallback((freq: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // audio not supported
    }
  }, [soundEnabled]);

  const startExercise = useCallback(() => {
    setScreen('exercise');
    setPhase('inhale');
    setPhaseProgress(0);
    setTimeLeft(totalSeconds);
    setPaused(false);
    playTone(440);
  }, [totalSeconds, playTone]);

  useEffect(() => {
    if (screen !== 'exercise' || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const TICK = 100; // ms
    let elapsed = 0; // ms since phase start
    let currentPhase: Phase = phase;
    let remaining = timeLeft;

    intervalRef.current = setInterval(() => {
      elapsed += TICK;
      remaining -= TICK / 1000;

      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        setTimeLeft(0);
        setPhaseProgress(1);
        setScreen('complete');
        return;
      }

      const progress = Math.min(elapsed / (PHASE_DURATION * 1000), 1);
      setPhaseProgress(progress);
      setTimeLeft(Math.ceil(remaining));

      if (elapsed >= PHASE_DURATION * 1000) {
        elapsed = 0;
        currentPhase = currentPhase === 'inhale' ? 'exhale' : 'inhale';
        setPhase(currentPhase);
        setPhaseProgress(0);
        playTone(currentPhase === 'inhale' ? 440 : 330);
      }
    }, TICK);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, paused, soundEnabled]);

  const handlePauseResume = () => {
    setPaused((p) => !p);
  };

  const handleQuit = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setScreen('config');
    setPhase('inhale');
    setPhaseProgress(0);
    setPaused(false);
  };

  const handleReplay = () => {
    startExercise();
  };

  // Circle scale: 0.45 (min) → 1 (max)
  const circleScale = phase === 'inhale'
    ? 0.45 + phaseProgress * 0.55
    : 1 - phaseProgress * 0.55;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
      {screen === 'config' && (
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition mb-6">
              <ChevronLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                <Wind className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Exercices de Respiration</h1>
            </div>
            <p className="text-gray-600 mt-1">Retrouvez calme et sérénité grâce à la respiration guidée</p>
          </div>

          {/* Exercise card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Wind className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold">Cohérence Cardiaque</h2>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                La cohérence cardiaque consiste à inspirer pendant 5 secondes et expirer pendant 5 secondes
                (rythme 5/5), pendant 5 minutes, afin de réguler le rythme cardiaque et réduire l'anxiété.
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Duration selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Durée de l'exercice
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDurationMin(opt.value)}
                      className={`py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        durationMin === opt.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-teal-300 hover:bg-teal-50/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-teal-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">Signal sonore</p>
                    <p className="text-xs text-gray-500">Tonalité lors des transitions</p>
                  </div>
                </div>
                <button
                  onClick={() => setSoundEnabled((s) => !s)}
                  className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                    soundEnabled ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={soundEnabled}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={startExercise}
                className="w-full py-4 bg-teal-600 text-white rounded-xl font-semibold text-lg hover:bg-teal-700 active:scale-95 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5" />
                Lancer l'exercice
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "Réduit l'anxiété", desc: 'Régule le système nerveux en quelques minutes' },
              { title: 'Améliore la concentration', desc: 'Oxygène le cerveau et clarifie les pensées' },
              { title: 'Baisse la tension', desc: 'Ralentit le rythme cardiaque naturellement' },
            ].map((b) => (
              <div key={b.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{b.title}</h3>
                <p className="text-xs text-gray-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === 'exercise' && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-teal-950 to-blue-950 flex flex-col items-center justify-center z-50">
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4">
            <div className="text-white/60 text-sm font-medium">Cohérence Cardiaque</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSoundEnabled((s) => !s)}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
                title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={handleQuit}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
                title="Quitter"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Timer */}
          <div className="text-white/50 text-2xl font-mono font-light mb-12 tracking-widest">
            {formatTime(timeLeft)}
          </div>

          {/* Breathing circle */}
          <div className="relative flex items-center justify-center mb-12">
            {/* Outer glow rings */}
            <div
              className="absolute rounded-full bg-teal-400/5 transition-all duration-1000"
              style={{
                width: `${320 * circleScale + 80}px`,
                height: `${320 * circleScale + 80}px`,
              }}
            />
            <div
              className="absolute rounded-full bg-teal-400/8 transition-all duration-1000"
              style={{
                width: `${320 * circleScale + 40}px`,
                height: `${320 * circleScale + 40}px`,
              }}
            />
            {/* Main circle */}
            <div
              className="rounded-full flex items-center justify-center transition-all shadow-2xl"
              style={{
                width: `${320 * circleScale}px`,
                height: `${320 * circleScale}px`,
                background: phase === 'inhale'
                  ? 'radial-gradient(circle, #2dd4bf, #0d9488)'
                  : 'radial-gradient(circle, #38bdf8, #0284c7)',
                transitionDuration: `${PHASE_DURATION * 1000}ms`,
                transitionTimingFunction: 'ease-in-out',
                boxShadow: phase === 'inhale'
                  ? '0 0 60px rgba(45,212,191,0.3), 0 0 120px rgba(45,212,191,0.15)'
                  : '0 0 60px rgba(56,189,248,0.3), 0 0 120px rgba(56,189,248,0.15)',
              }}
            >
              <span className="text-white font-light text-xl tracking-wide select-none">
                {phase === 'inhale' ? 'Inspirez...' : 'Expirez...'}
              </span>
            </div>
          </div>

          {/* Phase indicator */}
          <div className="flex items-center gap-6 mb-16">
            <div className={`text-sm font-medium transition-colors ${phase === 'inhale' ? 'text-teal-300' : 'text-white/30'}`}>
              Inspiration
            </div>
            <div className="w-32 h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all bg-gradient-to-r from-teal-400 to-blue-400"
                style={{
                  width: `${phaseProgress * 100}%`,
                  transitionDuration: '100ms',
                }}
              />
            </div>
            <div className={`text-sm font-medium transition-colors ${phase === 'exhale' ? 'text-blue-300' : 'text-white/30'}`}>
              Expiration
            </div>
          </div>

          {/* Controls */}
          <button
            onClick={handlePauseResume}
            className="flex items-center gap-3 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition backdrop-blur-sm border border-white/10"
          >
            {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            {paused ? 'Reprendre' : 'Pause'}
          </button>
        </div>
      )}

      {screen === 'complete' && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-teal-950 to-blue-950 flex flex-col items-center justify-center z-50 px-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-teal-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Bravo !</h2>
            <p className="text-white/70 mb-2">
              Vous avez complété {durationMin} {durationMin === 1 ? 'minute' : 'minutes'} de cohérence cardiaque.
            </p>
            <p className="text-white/50 text-sm mb-8">
              Prenez un moment pour ressentir la détente. Votre corps vous remercie.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleReplay}
                className="flex items-center justify-center gap-2 w-full py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-semibold transition"
              >
                <RotateCcw className="w-5 h-5" />
                Rejouer
              </button>
              <button
                onClick={() => setScreen('config')}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition border border-white/10"
              >
                Retour aux exercices
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
