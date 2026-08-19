import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
            <KeyRound className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié</h1>
          <p className="text-gray-600">Contactez un administrateur</p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm mb-6">
          Pour réinitialiser votre mot de passe, veuillez contacter un administrateur
          qui pourra vous aider à récupérer l'accès à votre compte.
        </div>

        <div className="text-center">
          <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700 transition">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
