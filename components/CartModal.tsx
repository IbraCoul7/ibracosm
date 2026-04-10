
import React from 'react';
import { CartItem } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onCheckout: (customerInfo: { firstName: string; lastName: string; contact?: string; address?: string }) => void;
}

const CartModal: React.FC<CartModalProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onUpdateQty, 
  onCheckout 
}) => {
  const [customerInfo, setCustomerInfo] = React.useState({
    firstName: '',
    lastName: '',
    contact: '',
    address: ''
  });

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckoutClick = () => {
    if (!customerInfo.firstName || !customerInfo.lastName) {
      alert('Veuillez remplir votre prénom et votre nom.');
      return;
    }
    onCheckout(customerInfo);
  };

  return (
    <div className="fixed inset-0 z-[110] overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 bottom-0 w-full sm:max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-stone-100 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-stone-900 brand-font">Votre Panier</h2>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-900 text-2xl">✕</button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                <span className="text-6xl">🛍️</span>
                <p>Votre panier est vide</p>
                <button 
                  onClick={onClose}
                  className="bg-stone-900 text-white px-6 py-2 rounded-full text-sm font-bold"
                >
                  Continuer mes achats
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.product.id} className="flex space-x-4">
                      <img 
                        src={item.product.imageUrl || 'https://picsum.photos/100/100'} 
                        className="w-20 h-20 rounded-xl object-cover"
                        alt={item.product.name}
                      />
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h4 className="font-bold text-stone-900">{item.product.name}</h4>
                          <button onClick={() => onRemove(item.product.id)} className="text-stone-300 hover:text-red-500">✕</button>
                        </div>
                        <p className="text-rose-600 font-bold text-sm">{(item.product.price * item.quantity).toLocaleString()} FCFA</p>
                        
                        <div className="flex items-center space-x-3 mt-2">
                          <button 
                            onClick={() => onUpdateQty(item.product.id, -1)}
                            className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQty(item.product.id, 1)}
                            className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-stone-100">
                  <h3 className="text-lg font-bold text-stone-900 mb-4">Vos Informations</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Prénom *</label>
                        <input 
                          type="text"
                          required
                          className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-200 outline-none text-sm"
                          value={customerInfo.firstName}
                          onChange={e => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Nom *</label>
                        <input 
                          type="text"
                          required
                          className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-200 outline-none text-sm"
                          value={customerInfo.lastName}
                          onChange={e => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Contact (Facultatif)</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-200 outline-none text-sm"
                        value={customerInfo.contact}
                        onChange={e => setCustomerInfo({...customerInfo, contact: e.target.value})}
                        placeholder="Téléphone ou Email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Adresse (Facultatif)</label>
                      <textarea 
                        rows={2}
                        className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-200 outline-none text-sm"
                        value={customerInfo.address}
                        onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t border-stone-100 bg-stone-50 space-y-4">
              <div className="flex justify-between text-lg">
                <span className="text-stone-500 font-medium">Total</span>
                <span className="text-stone-900 font-bold">{total.toLocaleString()} FCFA</span>
              </div>
              <p className="text-[10px] text-stone-400 text-center uppercase tracking-widest">
                La commande sera envoyée via WhatsApp
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={onClose}
                  className="flex-grow bg-stone-100 text-stone-600 py-4 rounded-xl font-bold hover:bg-stone-200 transition-all"
                >
                  Continuer
                </button>
                <button 
                  onClick={handleCheckoutClick}
                  className="flex-[2] bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center space-x-2"
                >
                  <span>Commander</span>
                  <span className="text-xl">💬</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
