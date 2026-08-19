import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, TrendingUp, ChartBar as BarChart3, Shield, Heart, Sparkles, Wind } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="text-center mb-16 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-600 rounded-3xl mb-6 shadow-lg">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">CESIZen</h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Votre compagnon de bien-être mental pour comprendre et suivre vos émotions au quotidien
          </p>
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/tracker"
                className="px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                Accéder au suivi
              </Link>
              <Link
                to="/profile"
                className="px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-50 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                Mon Profil
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                Commencer gratuitement
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-50 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                Se connecter
              </Link>
            </div>
          )}
        </header>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Pourquoi choisir CESIZen ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 rounded-2xl mb-4">
                <Heart className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Suivi Émotionnel Personnalisé</h3>
              <p className="text-gray-600 leading-relaxed">
                Enregistrez vos émotions avec précision grâce à un catalogue complet d'émotions primaires et secondaires.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Visualisations Intelligentes</h3>
              <p className="text-gray-600 leading-relaxed">
                Analysez vos tendances émotionnelles sur différentes périodes avec des statistiques détaillées et des graphiques intuitifs.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Progression Continue</h3>
              <p className="text-gray-600 leading-relaxed">
                Identifiez vos tendances et prenez conscience de votre évolution émotionnelle pour mieux gérer votre bien-être.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-2xl p-12 mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Comment ça fonctionne ?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Créez votre compte</h3>
                  <p className="text-gray-600">Inscrivez-vous en quelques secondes et commencez votre parcours vers un meilleur bien-être mental.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Enregistrez vos émotions</h3>
                  <p className="text-gray-600">Choisissez parmi un large catalogue d'émotions, définissez l'intensité et ajoutez des notes contextuelles.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysez vos tendances</h3>
                  <p className="text-gray-600">Visualisez vos tendances émotionnelles et identifiez ce qui influence votre bien-être au quotidien.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Breathing exercises teaser */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-slate-800 via-teal-900 to-blue-900 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8 p-10">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-teal-400/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full bg-teal-400/10 animate-ping" style={{ animationDuration: '3s' }} />
                  <Wind className="w-12 h-12 text-teal-300" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="text-teal-400 text-sm font-semibold uppercase tracking-wider">Nouveau</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-1 mb-3">
                  Exercices de Respiration Guidée
                </h2>
                <p className="text-white/70 leading-relaxed mb-6 max-w-lg">
                  Réduisez votre stress et retrouvez votre calme en quelques minutes grâce à nos exercices guidés.
                  Aucun compte requis — accessible à tous, à tout moment.
                </p>
                <Link
                  to="/respiration"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
                >
                  <Wind className="w-5 h-5" />
                  Découvrir les exercices
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Fonctionnalités clés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <Sparkles className="w-8 h-8 text-teal-600 mb-3 mx-auto" />
              <h3 className="font-semibold text-gray-900 mb-2">Interface Intuitive</h3>
              <p className="text-gray-600 text-sm">Design moderne et épuré pour une expérience utilisateur optimale</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <Shield className="w-8 h-8 text-teal-600 mb-3 mx-auto" />
              <h3 className="font-semibold text-gray-900 mb-2">Données Sécurisées</h3>
              <p className="text-gray-600 text-sm">Vos données sont protégées avec les meilleurs standards de sécurité</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <BarChart3 className="w-8 h-8 text-teal-600 mb-3 mx-auto" />
              <h3 className="font-semibold text-gray-900 mb-2">Statistiques Détaillées</h3>
              <p className="text-gray-600 text-sm">Analyses par jour, semaine, mois et année pour suivre votre évolution</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <Heart className="w-8 h-8 text-teal-600 mb-3 mx-auto" />
              <h3 className="font-semibold text-gray-900 mb-2">Journal Personnel</h3>
              <p className="text-gray-600 text-sm">Ajoutez des notes pour contextualiser vos émotions et mieux les comprendre</p>
            </div>
          </div>
        </section>

        {!user && (
          <section className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-3xl shadow-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à commencer votre voyage ?</h2>
            <p className="text-xl mb-8 opacity-90">Rejoignez CESIZen aujourd'hui et prenez le contrôle de votre bien-être mental</p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-100 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              Créer mon compte gratuitement
            </Link>
          </section>
        )}

        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>2024 CESIZen. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
}
