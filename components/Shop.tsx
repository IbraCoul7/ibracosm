
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';

interface ShopProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
}

const ProductCard: React.FC<{ product: Product, onAddToCart: (product: Product, quantity: number) => void, onViewDetails: (product: Product) => void }> = ({ product, onAddToCart, onViewDetails }) => {
  const [qty, setQty] = useState(1);

  const [isAdded, setIsAdded] = useState(false);

  const handleQtyChange = (delta: number) => {
    setQty(prev => Math.max(1, Math.min(product.quantity, prev + delta)));
  };

  const handleAddToCart = () => {
    onAddToCart(product, qty);
    setQty(1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl transition-shadow group flex flex-col">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={product.imageUrl || 'https://picsum.photos/400/400?grayscale'} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
            <span className="text-white font-bold px-4 py-2 border-2 border-white uppercase tracking-widest">Rupture</span>
          </div>
        )}
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-stone-900">{product.name}</h3>
          <span className="text-rose-600 font-bold whitespace-nowrap ml-2">{product.price.toLocaleString()} FCFA</span>
        </div>
        
        <p className="text-stone-500 text-sm mb-6 leading-relaxed flex-grow">
          {product.description}
        </p>
        
        <div className="mt-auto space-y-4">
          {product.quantity > 0 && (
            <div className="flex items-center justify-between bg-stone-50 p-2 rounded-lg border border-stone-100">
              <span className="text-xs font-bold text-stone-400 uppercase ml-2">Quantité</span>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleQtyChange(-1)}
                  className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors shadow-sm"
                >
                  -
                </button>
                <span className="font-bold text-stone-900 w-4 text-center">{qty}</span>
                <button 
                  onClick={() => handleQtyChange(1)}
                  className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <button 
              disabled={product.quantity === 0 || isAdded}
              onClick={handleAddToCart}
              className={`flex-grow py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${
                isAdded ? 'bg-green-600 text-white' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100'
              }`}
            >
              {isAdded ? 'Ajouté ! ✨' : 'Ajouter au panier'}
            </button>
            <button 
              onClick={() => onViewDetails(product)}
              className="bg-stone-100 text-stone-600 p-3 rounded-xl hover:bg-stone-200 transition-colors"
              title="Voir détails"
            >
              👁️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Shop: React.FC<ShopProps> = ({ products, onAddToCart }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalQty, setModalQty] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [modalIsAdded, setModalIsAdded] = useState(false);

  const suggestions = products
    .filter(p => searchTerm && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (name: string) => {
    setSearchTerm(name);
    setShowSuggestions(false);
  };

  return (
    <div>
      <section className="mb-12 text-center">
        <h2 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">Notre Collection</h2>
        <p className="text-stone-500 max-w-2xl mx-auto mb-8">
          Découvrez notre sélection exclusive de produits cosmétiques pour sublimer votre beauté naturelle.
        </p>

        {/* Barre de recherche avec autocomplétion */}
        <div className="max-w-md mx-auto relative group px-4 sm:px-0" ref={searchRef}>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-rose-500">
            <span className="text-stone-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-rose-50 focus:border-rose-300 outline-none transition-all text-stone-700 placeholder:text-stone-300"
            value={searchTerm}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
          />
          
          {/* Menu de suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="py-2">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectSuggestion(p.name)}
                    className="w-full px-5 py-3 text-left hover:bg-rose-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={p.imageUrl} className="w-8 h-8 rounded-full object-cover border border-stone-100" alt="" />
                      <span className="text-stone-700 font-medium">{p.name}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-stone-300">Suggéré</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchTerm && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setShowSuggestions(false);
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-300 hover:text-stone-500 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
          <div className="text-5xl mb-4 opacity-30">✨</div>
          <p className="text-stone-400 font-medium">Aucun produit en stock pour le moment. Revenez bientôt !</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-400 text-lg">Aucun produit ne correspond à "{searchTerm}"</p>
          <button 
            onClick={() => setSearchTerm('')}
            className="mt-4 text-rose-600 font-bold hover:underline"
          >
            Effacer la recherche
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart} 
              onViewDetails={setSelectedProduct} 
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] max-w-3xl w-full overflow-hidden flex flex-col md:flex-row relative animate-in fade-in zoom-in duration-300 shadow-2xl max-h-[90vh] overflow-y-auto md:overflow-hidden">
            <button 
              onClick={() => {
                setSelectedProduct(null);
                setModalQty(1);
              }}
              className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/90 hover:bg-white rounded-full p-2 md:p-3 z-10 shadow-lg border border-stone-100 transition-all text-stone-900 font-bold"
            >
              ✕
            </button>
            <div className="md:w-1/2 h-64 sm:h-80 md:h-auto">
              <img 
                src={selectedProduct.imageUrl || 'https://picsum.photos/600/600'} 
                className="w-full h-full object-cover"
                alt={selectedProduct.name}
              />
            </div>
            <div className="md:w-1/2 p-6 sm:p-10 flex flex-col">
              <div className="mb-4 sm:mb-6">
                <span className="text-[10px] sm:text-xs font-bold text-rose-500 uppercase tracking-widest mb-1 sm:mb-2 block">Premium Cosmetics</span>
                <h2 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 brand-font text-stone-900">{selectedProduct.name}</h2>
                <p className="text-rose-600 text-2xl sm:text-3xl font-bold">{selectedProduct.price.toLocaleString()} FCFA</p>
              </div>
              
              <div className="flex-grow space-y-4 sm:space-y-6 overflow-y-auto max-h-[200px] sm:max-h-[300px] pr-2 custom-scrollbar">
                <p className="text-stone-600 leading-relaxed text-sm sm:text-base italic">{selectedProduct.description}</p>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-stone-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <p>Stock actuel: <span className="font-bold text-stone-700">{selectedProduct.quantity} unités</span></p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                {selectedProduct.quantity > 0 && (
                   <div className="flex items-center justify-between bg-stone-50 p-2 sm:p-3 rounded-2xl border border-stone-100">
                      <span className="text-[10px] sm:text-sm font-bold text-stone-500 uppercase ml-1 sm:ml-2">Quantité</span>
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <button 
                          onClick={() => setModalQty(prev => Math.max(1, prev - 1))}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 shadow-sm"
                        >
                          -
                        </button>
                        <span className="font-bold text-lg sm:text-xl text-stone-900 w-4 sm:w-6 text-center">{modalQty}</span>
                        <button 
                          onClick={() => setModalQty(prev => Math.max(1, Math.min(selectedProduct.quantity, prev + 1)))}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 shadow-sm"
                        >
                          +
                        </button>
                      </div>
                   </div>
                )}

                <button 
                  disabled={selectedProduct.quantity === 0 || modalIsAdded}
                  onClick={() => {
                    onAddToCart(selectedProduct, modalQty);
                    setModalIsAdded(true);
                    setTimeout(() => {
                      setSelectedProduct(null);
                      setModalQty(1);
                      setModalIsAdded(false);
                    }, 1000);
                  }}
                  className={`w-full py-4 sm:py-5 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-xl flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg ${
                    modalIsAdded ? 'bg-green-600 text-white' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100'
                  }`}
                >
                  <span>{modalIsAdded ? 'Ajouté ! ✨' : 'Ajouter au panier'}</span>
                  {!modalIsAdded && <span>✨</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
