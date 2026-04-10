
import React from 'react';
import { OrderSummary } from '../types';

interface OrderConfirmationProps {
  order: OrderSummary;
  onBackToShop: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order, onBackToShop }) => {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
        <div className="bg-rose-50 p-8 text-center border-b border-rose-100">
          <div className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-lg shadow-rose-200">
            ✅
          </div>
          <h2 className="text-3xl font-bold text-stone-900 brand-font mb-2">Commande Reçue !</h2>
          <p className="text-rose-700 font-medium">Référence : {order.orderId}</p>
        </div>

        <div className="p-8">
          <h3 className="text-lg font-bold text-stone-900 mb-6 border-b border-stone-50 pb-2 uppercase tracking-wider">Résumé de votre commande</h3>
          
          <div className="space-y-4 mb-8">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-stone-600">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                      <img src={item.product.imageUrl} className="w-full h-full object-cover" alt={item.product.name} />
                   </div>
                   <span>
                    <span className="font-bold text-stone-900">{item.quantity}x</span> {item.product.name}
                   </span>
                </div>
                <span className="font-medium">{(item.product.price * item.quantity).toLocaleString()} FCFA</span>
              </div>
            ))}
            <div className="pt-6 border-t border-stone-100 flex justify-between items-center text-xl font-bold text-stone-900">
              <span>Total à payer</span>
              <span className="text-rose-600">{order.total.toLocaleString()} FCFA</span>
            </div>
          </div>

          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 mb-8">
            <h4 className="font-bold text-stone-900 mb-3 flex items-center space-x-2">
              <span>🚀</span>
              <span>Prochaines étapes</span>
            </h4>
            <ul className="text-stone-500 text-sm space-y-3 leading-relaxed">
              <li className="flex items-start space-x-3">
                <span className="text-rose-600 font-bold">1.</span>
                <span>Votre demande a été ouverte sur WhatsApp. Si ce n'est pas le cas, cliquez sur le bouton "Relancer WhatsApp" ci-dessous.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-rose-600 font-bold">2.</span>
                <span>IbraCosm confirmera la disponibilité de vos produits et fixera le lieu de livraison avec vous.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-rose-600 font-bold">3.</span>
                <span>Le paiement se fera selon les modalités convenues lors de l'échange.</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => {
                 const itemsList = order.items.map(item => `- ${item.product.name} (x${item.quantity})`).join('\n');
                 
                 let customerDetails = '';
                 if (order.customerInfo) {
                   customerDetails = `Client : ${order.customerInfo.firstName} ${order.customerInfo.lastName}`;
                   if (order.customerInfo.contact) customerDetails += `\nContact : ${order.customerInfo.contact}`;
                   if (order.customerInfo.address) customerDetails += `\nAdresse : ${order.customerInfo.address}`;
                 }

                 const isMultiple = order.items.length > 1 || (order.items.length === 1 && order.items[0].quantity > 1);
                 const productWord = isMultiple ? 'ces produits' : 'ce produit';

                 const text = `Bonjour IbraCosm,\n\n${customerDetails}\n\nJe souhaiterais commander ${productWord} (Commande #${order.orderId}) :\n\n${itemsList}\n\nTotal à payer : ${order.total.toLocaleString()} FCFA\n\nSont-ils disponibles ? Merci !`;
                 const url = `https://wa.me/22396406129?text=${encodeURIComponent(text)}`;
                 window.open(url, '_blank');
              }}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-green-100"
            >
              <span>Relancer WhatsApp</span>
              <span>💬</span>
            </button>
            <button 
              onClick={onBackToShop}
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all"
            >
              Retour Boutique
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
