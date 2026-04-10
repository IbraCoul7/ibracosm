
import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface InventoryManagerProps {
  products: Product[];
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  onDelete: (id: string) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ products, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const initialFormState = {
    name: '',
    description: '',
    quantity: 0,
    price: 0,
    arrivalDate: new Date().toISOString().split('T')[0],
    imageUrl: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Sync form when entering edit mode
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description,
        quantity: editingProduct.quantity,
        price: editingProduct.price,
        arrivalDate: editingProduct.arrivalDate,
        imageUrl: editingProduct.imageUrl
      });
      setIsFormOpen(true);
    } else {
      setFormData(initialFormState);
    }
  }, [editingProduct]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 800KB to stay safe within 1MB Firestore limit)
      if (file.size > 800 * 1024) {
        alert("L'image est trop volumineuse. Veuillez choisir une image de moins de 800 Ko.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdate({
        ...formData,
        id: editingProduct.id
      });
    } else {
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString(),
      };
      onAdd(newProduct);
    }
    closeForm();
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setFormData(initialFormState);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-stone-900">Gestion de l'Inventaire</h2>
          <p className="text-stone-500">Ajoutez et gérez vos stocks de produits cosmétiques.</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
          className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-stone-800 transition-all flex items-center space-x-2"
        >
          <span>➕ Ajouter un produit</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-stone-100 max-w-3xl mx-auto animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">{editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}</h3>
            <button onClick={closeForm} className="text-stone-400 hover:text-stone-900">Fermer</button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-2">Nom du produit</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Masque à l'argile rose"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-stone-700">Description</label>
              </div>
              <textarea 
                required
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none transition-all"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Quantité</label>
              <input 
                type="number" 
                required
                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-200 outline-none"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Prix (FCFA)</label>
              <input 
                type="number" 
                required
                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-200 outline-none"
                value={formData.price}
                onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Date d'arrivée</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-200 outline-none"
                value={formData.arrivalDate}
                onChange={e => setFormData({...formData, arrivalDate: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Photo du produit</label>
              <div className="flex items-center space-x-4">
                {formData.imageUrl && (
                   <img src={formData.imageUrl} className="w-12 h-12 rounded object-cover border border-stone-100" alt="Preview" />
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button 
                type="submit"
                className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
              >
                {editingProduct ? 'Enregistrer les modifications' : 'Enregistrer le produit'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-stone-50 text-stone-500 uppercase text-xs font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Produit</th>
              <th className="px-6 py-4">Arrivée</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Prix</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-stone-400">Aucun produit dans l'inventaire</td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img src={product.imageUrl || 'https://picsum.photos/50/50'} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-stone-900">{product.name}</p>
                        <p className="text-xs text-stone-400 line-clamp-1 max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-600 text-sm">
                    {new Date(product.arrivalDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.quantity < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {product.quantity} unités
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-900 font-medium">
                    {product.price.toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="text-stone-400 hover:text-rose-600 transition-colors flex items-center space-x-1"
                      >
                        <span>✏️ Modifier</span>
                      </button>
                      <button 
                        onClick={() => onDelete(product.id)}
                        className="text-stone-300 hover:text-red-600 transition-colors flex items-center space-x-1"
                      >
                        <span>🗑️ Supprimer</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
};

export default InventoryManager;
