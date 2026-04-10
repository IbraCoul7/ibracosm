
import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => boolean;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // After Google login, we still check the password for the UI admin state
      // but the Firebase Auth will now provide the UID for Firestore rules.
      setError(false);
    } catch (err) {
      console.error("Google Login Error:", err);
      setError(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(password)) {
      setPassword('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-stone-900 mb-2 brand-font">Accès Administrateur</h2>
        <p className="text-stone-500 text-sm mb-6">Entrez votre mot de passe pour accéder à la gestion.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password" 
              autoFocus
              className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500' : 'border-stone-200'} focus:ring-2 focus:ring-rose-200 outline-none transition-all`}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
            />
            {error && <p className="text-red-500 text-xs mt-1">Erreur de connexion ou mot de passe incorrect</p>}
          </div>
          <button 
            type="submit"
            className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-100">
          <p className="text-stone-400 text-xs text-center mb-4 uppercase tracking-widest font-bold">Ou via Google (Requis pour Firestore)</p>
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center space-x-3 bg-white border border-stone-200 text-stone-700 py-3 rounded-xl font-bold hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            <span>{isLoggingIn ? 'Connexion...' : 'Continuer avec Google'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
