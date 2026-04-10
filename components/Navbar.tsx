
import React from 'react';
import { View } from '../types';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  cartCount: number;
  onCartClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  setView, 
  isAdmin, 
  onLoginClick, 
  onLogout,
  cartCount,
  onCartClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleViewChange = (view: View) => {
    setView(view);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => handleViewChange(View.SHOP)}
        >
          <div className="w-10 h-10 bg-rose-200 rounded-full flex items-center justify-center">
            <span className="brand-font text-xl font-bold text-rose-800">IC</span>
          </div>
          <h1 className="brand-font text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">IbraCosm</h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => handleViewChange(View.SHOP)}
            className={`text-sm font-medium transition-colors ${currentView === View.SHOP ? 'text-rose-600 border-b-2 border-rose-600' : 'text-stone-500 hover:text-stone-900'}`}
          >
            Boutique
          </button>
          
          {isAdmin && (
            <>
              <button 
                onClick={() => handleViewChange(View.ADMIN_INVENTORY)}
                className={`text-sm font-medium transition-colors ${currentView === View.ADMIN_INVENTORY ? 'text-rose-600 border-b-2 border-rose-600' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Inventaire
              </button>
              <button 
                onClick={() => handleViewChange(View.ADMIN_STATS)}
                className={`text-sm font-medium transition-colors ${currentView === View.ADMIN_STATS ? 'text-rose-600 border-b-2 border-rose-600' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Statistiques
              </button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <button 
            onClick={onCartClick}
            className="relative p-2 text-stone-600 hover:text-rose-600 transition-colors"
          >
            <span className="text-2xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>

          <div className="hidden sm:block">
            {isAdmin ? (
              <button 
                onClick={onLogout}
                className="text-xs font-bold text-stone-400 hover:text-stone-900 transition-colors border border-stone-200 px-3 py-1.5 rounded-lg"
              >
                Déconnexion
              </button>
            ) : (
              <button 
                onClick={onLoginClick}
                className="text-xs font-bold text-stone-400 hover:text-stone-900 transition-colors"
              >
                Espace Admin
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-rose-600 transition-colors"
          >
            <span className="text-2xl">{isMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 py-4 px-4 space-y-4 animate-in slide-in-from-top duration-200">
          <button 
            onClick={() => handleViewChange(View.SHOP)}
            className={`block w-full text-left px-4 py-2 rounded-xl text-sm font-bold ${currentView === View.SHOP ? 'bg-rose-50 text-rose-600' : 'text-stone-500'}`}
          >
            🛍️ Boutique
          </button>
          
          {isAdmin ? (
            <>
              <button 
                onClick={() => handleViewChange(View.ADMIN_INVENTORY)}
                className={`block w-full text-left px-4 py-2 rounded-xl text-sm font-bold ${currentView === View.ADMIN_INVENTORY ? 'bg-rose-50 text-rose-600' : 'text-stone-500'}`}
              >
                📦 Inventaire
              </button>
              <button 
                onClick={() => handleViewChange(View.ADMIN_STATS)}
                className={`block w-full text-left px-4 py-2 rounded-xl text-sm font-bold ${currentView === View.ADMIN_STATS ? 'bg-rose-50 text-rose-600' : 'text-stone-500'}`}
              >
                📊 Statistiques
              </button>
              <button 
                onClick={() => { onLogout(); setIsMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50"
              >
                🚪 Déconnexion
              </button>
            </>
          ) : (
            <button 
              onClick={() => { onLoginClick(); setIsMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 rounded-xl text-sm font-bold text-stone-500 hover:bg-stone-50"
            >
              🔐 Espace Admin
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
