
import React, { useState } from 'react';
import { Product, Sale, Order, OrderStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StatsDashboardProps {
  products: Product[];
  sales: Sale[];
  orders: Order[];
  onAddSale: (sale: Sale) => void;
  onUpdateSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (id: string) => void;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ 
  products, 
  sales, 
  orders, 
  onAddSale, 
  onUpdateSale, 
  onDeleteSale,
  onUpdateOrderStatus,
  onDeleteOrder
}) => {
  const [salesTimeframe, setSalesTimeframe] = useState<'7d' | 'month' | 'year'>('month');
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isAddingSale, setIsAddingSale] = useState(false);
  const getLocalISOString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [newSaleData, setNewSaleData] = useState({
    productId: '',
    quantity: 1,
    date: getLocalISOString()
  });
  
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalPrice, 0);
  const totalUnitsSold = sales.reduce((acc, sale) => acc + sale.quantity, 0);
  const totalInStock = products.reduce((acc, prod) => acc + prod.quantity, 0);

  // Helper to get start date based on timeframe
  const getStartDate = (timeframe: '7d' | 'month' | 'year') => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (timeframe === '7d') d.setDate(d.getDate() - 7);
    else if (timeframe === 'month') d.setMonth(d.getMonth() - 1);
    else if (timeframe === 'year') d.setFullYear(d.getFullYear() - 1);
    return d;
  };

  const startDate = getStartDate(salesTimeframe);

  // Data for sales trend chart
  const getTrendData = () => {
    if (salesTimeframe === 'year') {
      // Monthly aggregation for the last 12 months
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthYear = d.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
        const month = d.getMonth();
        const year = d.getFullYear();
        
        const total = sales
          .filter(s => {
            const sDate = new Date(s.date);
            return sDate.getMonth() === month && sDate.getFullYear() === year;
          })
          .reduce((acc, s) => acc + s.totalPrice, 0);
        return { label: monthYear, total, fullDate: d.toISOString() };
      }).reverse();
    } else {
      // Daily aggregation for 7d or month
      const days = salesTimeframe === '7d' ? 7 : 30;
      return Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const total = sales
          .filter(s => s.date.startsWith(dateStr))
          .reduce((acc, s) => acc + s.totalPrice, 0);
        return { label: dateStr, total, fullDate: d.toISOString() };
      }).reverse();
    }
  };

  const trendData = getTrendData();

  // Data for stock distribution
  const stockData = products.map(p => ({
    name: p.name,
    value: p.quantity
  })).filter(p => p.value > 0);

  // Data for sales by product in the selected timeframe
  const salesByProduct = sales
    .filter(s => new Date(s.date) >= startDate)
    .reduce((acc, sale) => {
      const existing = acc.find(item => item.name === sale.productName);
      if (existing) {
        existing.value += sale.totalPrice;
      } else {
        acc.push({ name: sale.productName, value: sale.totalPrice });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#fff1f2', '#e11d48'];

  const handleUpdateSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSale) {
      onUpdateSale(editingSale);
      setEditingSale(null);
    }
  };

  const handleNewSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === newSaleData.productId);
    if (!product) return;

    const sale: Sale = {
      id: Date.now().toString() + Math.random(),
      productId: product.id,
      productName: product.name,
      quantity: newSaleData.quantity,
      totalPrice: product.price * newSaleData.quantity,
      date: new Date(newSaleData.date).toISOString()
    };

    onAddSale(sale);
    setIsAddingSale(false);
    setNewSaleData({
      productId: '',
      quantity: 1,
      date: getLocalISOString()
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-stone-900">Statistiques & Performances</h2>
          <p className="text-stone-500">Aperçu en temps réel de votre activité commerciale.</p>
        </div>
        <div className="flex items-center bg-stone-100 p-1 rounded-xl">
          <button 
            onClick={() => setSalesTimeframe('7d')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${salesTimeframe === '7d' ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            7 Jours
          </button>
          <button 
            onClick={() => setSalesTimeframe('month')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${salesTimeframe === 'month' ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Mois
          </button>
          <button 
            onClick={() => setSalesTimeframe('year')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${salesTimeframe === 'year' ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Année
          </button>
        </div>
        <button 
          onClick={() => setIsAddingSale(true)}
          className="bg-rose-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-700 transition-all flex items-center space-x-2"
        >
          <span>💰 Enregistrer une vente</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <p className="text-stone-500 text-sm font-medium uppercase tracking-wider mb-2">Chiffre d'Affaires Total</p>
          <p className="text-3xl font-bold text-stone-900">{totalRevenue.toLocaleString()} <span className="text-sm font-normal text-stone-400">FCFA</span></p>
          <div className="mt-4 flex items-center text-green-500 text-sm">
            <span>Depuis le début</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <p className="text-stone-500 text-sm font-medium uppercase tracking-wider mb-2">Unités Vendues</p>
          <p className="text-3xl font-bold text-stone-900">{totalUnitsSold} <span className="text-sm font-normal text-stone-400">produits</span></p>
          <div className="mt-4 flex items-center text-rose-500 text-sm">
            <span>Historique complet</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <p className="text-stone-500 text-sm font-medium uppercase tracking-wider mb-2">Stock Disponible</p>
          <p className="text-3xl font-bold text-stone-900">{totalInStock} <span className="text-sm font-normal text-stone-400">articles</span></p>
          <div className="mt-4 flex items-center text-stone-400 text-sm">
            <span>Sur {products.length} références</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
          <h3 className="text-xl font-bold mb-6">
            {salesTimeframe === '7d' ? 'Ventes des 7 derniers jours' : 
             salesTimeframe === 'month' ? 'Ventes des 30 derniers jours' : 
             'Ventes des 12 derniers mois'}
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis 
                  dataKey="label" 
                  stroke="#a8a29e" 
                  fontSize={10} 
                  tickFormatter={(val) => {
                    if (salesTimeframe === 'year') return val;
                    return new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                  }} 
                />
                <YAxis stroke="#a8a29e" fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Ventes']}
                  labelFormatter={(label) => {
                    if (salesTimeframe === 'year') return label;
                    return new Date(label).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                  }}
                />
                <Bar dataKey="total" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={salesTimeframe === 'month' ? 15 : 40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Product */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
          <h3 className="text-xl font-bold mb-6">
            {salesTimeframe === '7d' ? 'Ventes par Produit (7j)' : 
             salesTimeframe === 'month' ? 'Ventes par Produit (Mois)' : 
             'Ventes par Produit (Année)'}
          </h3>
          {salesByProduct.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-stone-400">
              Aucune vente sur cette période
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByProduct} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                  <XAxis type="number" stroke="#a8a29e" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#a8a29e" fontSize={10} width={100} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Chiffre d\'affaires']}
                  />
                  <Bar dataKey="value" fill="#fb7185" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Inventory Distribution */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
          <h3 className="text-xl font-bold mb-6">Répartition du Stock</h3>
          {stockData.length === 0 ? (
             <div className="h-80 flex items-center justify-center text-stone-400">
                Aucune donnée de stock
             </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {stockData.slice(0, 5).map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-stone-500">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Sale Modal */}
      {editingSale && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-stone-900 mb-6">Modifier l'enregistrement de vente</h3>
            <form onSubmit={handleUpdateSaleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Produit</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-rose-200"
                  value={editingSale.productName}
                  onChange={e => setEditingSale({...editingSale, productName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Quantité</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none"
                    value={editingSale.quantity}
                    onChange={e => setEditingSale({...editingSale, quantity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Montant Total</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none"
                    value={editingSale.totalPrice}
                    onChange={e => setEditingSale({...editingSale, totalPrice: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Date</label>
                <input 
                  type="datetime-local"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none"
                  value={new Date(editingSale.date).toISOString().slice(0, 16)}
                  onChange={e => setEditingSale({...editingSale, date: new Date(e.target.value).toISOString()})}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingSale(null)}
                  className="flex-grow bg-stone-100 text-stone-600 py-3 rounded-xl font-bold hover:bg-stone-200"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-grow bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Sale Modal */}
      {isAddingSale && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-stone-900 mb-6">Enregistrer une nouvelle vente</h3>
            <form onSubmit={handleNewSaleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Produit</label>
                <select 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-rose-200"
                  value={newSaleData.productId}
                  onChange={e => setNewSaleData({...newSaleData, productId: e.target.value})}
                >
                  <option value="">Sélectionner un produit...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.quantity} en stock)</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Quantité</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none"
                    value={newSaleData.quantity}
                    onChange={e => setNewSaleData({...newSaleData, quantity: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Date</label>
                  <input 
                    type="datetime-local"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none"
                    value={newSaleData.date}
                    onChange={e => setNewSaleData({...newSaleData, date: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddingSale(false)}
                  className="flex-grow bg-stone-100 text-stone-600 py-3 rounded-xl font-bold hover:bg-stone-200"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={!newSaleData.productId}
                  className="flex-grow bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 disabled:opacity-50"
                >
                  Enregistrer la vente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Sales List */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-6 border-b border-stone-50 flex justify-between items-center">
          <h3 className="text-xl font-bold">Dernières Ventes</h3>
          <span className="text-xs text-stone-400 font-medium">Historique modifiable par l'admin</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-stone-50 text-stone-400 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Quantité</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-300">Aucune vente enregistrée pour le moment</td>
                </tr>
              ) : (
                [...sales].reverse().map(sale => (
                  <tr key={sale.id} className="text-sm hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-stone-900">{sale.productName}</td>
                    <td className="px-6 py-4 text-stone-600">{sale.quantity}</td>
                    <td className="px-6 py-4 font-bold text-stone-900">{sale.totalPrice.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4 text-stone-400">{new Date(sale.date).toLocaleString('fr-FR')}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-4">
                        <button 
                          onClick={() => setEditingSale(sale)}
                          className="text-stone-400 hover:text-rose-600 transition-colors"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => onDeleteSale(sale.id)}
                          className="text-stone-300 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          🗑️
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

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-6 border-b border-stone-50 flex justify-between items-center">
          <h3 className="text-xl font-bold">Commandes Reçues</h3>
          <span className="text-xs text-stone-400 font-medium">Suivi des demandes WhatsApp</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-stone-50 text-stone-400 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Réf / Date</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Produits</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-300">Aucune commande enregistrée</td>
                </tr>
              ) : (
                [...orders].reverse().map(order => (
                  <tr key={order.id} className="text-sm hover:bg-stone-50 transition-colors align-top">
                    <td className="px-6 py-4">
                      <p className="font-bold text-stone-900">#{order.orderId}</p>
                      <p className="text-xs text-stone-400">{new Date(order.date).toLocaleString('fr-FR')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-900">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                      {order.customerInfo.contact && <p className="text-xs text-stone-500">📞 {order.customerInfo.contact}</p>}
                      {order.customerInfo.address && <p className="text-xs text-stone-400 italic mt-1 line-clamp-1">📍 {order.customerInfo.address}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <ul className="text-xs space-y-1">
                        {order.items.map((item, i) => (
                          <li key={i} className="text-stone-600">
                            <span className="font-bold">{item.quantity}x</span> {item.product.name}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 font-bold text-stone-900">
                      {order.total.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-2 py-1 rounded-full border-none outline-none cursor-pointer ${
                          order.status === OrderStatus.PENDING ? 'bg-amber-50 text-amber-600' :
                          order.status === OrderStatus.COMPLETED ? 'bg-green-50 text-green-600' :
                          'bg-stone-100 text-stone-500'
                        }`}
                      >
                        <option value={OrderStatus.PENDING}>En attente</option>
                        <option value={OrderStatus.COMPLETED}>Terminée</option>
                        <option value={OrderStatus.CANCELLED}>Annulée</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onDeleteOrder(order.id)}
                        className="text-stone-300 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
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

export default StatsDashboard;
