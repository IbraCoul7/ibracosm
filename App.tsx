
import React, { useState, useEffect, Component } from 'react';
import { View, Product, Sale, CartItem, OrderSummary, Order, OrderStatus } from './types';
import Navbar from './components/Navbar';
import Shop from './components/Shop';
import InventoryManager from './components/InventoryManager';
import StatsDashboard from './components/StatsDashboard';
import CartModal from './components/CartModal';
import AdminLoginModal from './components/AdminLoginModal';
import OrderConfirmation from './components/OrderConfirmation';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDocFromServer
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebase';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

class AppErrorBoundary extends Component<any, any> {
  state: any;
  props: any;

  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("AppErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let displayMessage = "Une erreur inattendue est survenue.";
      try {
        const parsed = JSON.parse(this.state.errorInfo || "");
        if (parsed.error && parsed.error.includes("Missing or insufficient permissions")) {
          displayMessage = "Vous n'avez pas les permissions nécessaires pour effectuer cette action.";
        }
      } catch (e) {
        // Not JSON, use default
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            <div className="text-rose-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">Oups ! Quelque chose s'est mal passé.</h2>
            <p className="text-stone-600 mb-6">{displayMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-800 transition-all"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.SHOP);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [lastOrder, setLastOrder] = useState<OrderSummary | null>(null);
  const [user, setUser] = useState<any>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Trigger error boundary for async errors
  if (globalError) {
    throw new Error(globalError);
  }

  // Load initial data and setup real-time listeners
  useEffect(() => {
    const savedAdmin = sessionStorage.getItem('ibra_admin');
    if (savedAdmin === 'true') setIsAdmin(true);

    // Auth listener
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && u.email === 'ic6687514@gmail.com') {
        setIsAdmin(true);
        sessionStorage.setItem('ibra_admin', 'true');
      }
    });

    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    };
    testConnection();

    // Listen to products (Publicly readable)
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
      setProducts(productsData);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'products');
      } catch (e: any) {
        setGlobalError(e.message);
      }
    });

    return () => {
      unsubAuth();
      unsubProducts();
    };
  }, []);

  // Admin-only listeners
  useEffect(() => {
    let unsubSales: (() => void) | undefined;
    let unsubOrders: (() => void) | undefined;

    // Only subscribe if we have an admin user logged in
    if (isAdmin && user && user.email === 'ic6687514@gmail.com') {
      // Listen to sales
      unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
        const salesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Sale));
        setSales(salesData);
      }, (error) => {
        // Only report if we are still supposed to be admin
        if (isAdmin) {
          try {
            handleFirestoreError(error, OperationType.LIST, 'sales');
          } catch (e: any) {
            setGlobalError(e.message);
          }
        }
      });

      // Listen to orders
      unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
        setOrders(ordersData);
      }, (error) => {
        // Only report if we are still supposed to be admin
        if (isAdmin) {
          try {
            handleFirestoreError(error, OperationType.LIST, 'orders');
          } catch (e: any) {
            setGlobalError(e.message);
          }
        }
      });
    } else {
      // Clear data if not admin
      setSales([]);
      setOrders([]);
    }

    return () => {
      unsubSales?.();
      unsubOrders?.();
    };
  }, [isAdmin, user]);

  const addProduct = async (product: Product) => {
    try {
      const { id, ...data } = product;
      await setDoc(doc(db, 'products', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const { id, ...data } = updatedProduct;
      await updateDoc(doc(db, 'products', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${updatedProduct.id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    if (window.confirm(`Voulez-vous vraiment supprimer le produit "${product.name}" ? Cette action est irréversible.`)) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  const addSale = async (sale: Sale) => {
    try {
      // Update product stock
      const productRef = doc(db, 'products', sale.productId);
      const productDoc = products.find(p => p.id === sale.productId);
      if (productDoc) {
        await updateDoc(productRef, {
          quantity: Math.max(0, productDoc.quantity - sale.quantity)
        });
      }
      
      const { id, ...data } = sale;
      await setDoc(doc(db, 'sales', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'sales');
    }
  };

  const updateSale = async (updatedSale: Sale) => {
    try {
      const oldSale = sales.find(s => s.id === updatedSale.id);
      if (oldSale) {
        const diff = oldSale.quantity - updatedSale.quantity;
        if (diff !== 0) {
          const productRef = doc(db, 'products', updatedSale.productId);
          const productDoc = products.find(p => p.id === updatedSale.productId);
          if (productDoc) {
            await updateDoc(productRef, {
              quantity: productDoc.quantity + diff
            });
          }
        }
      }
      const { id, ...data } = updatedSale;
      await updateDoc(doc(db, 'sales', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `sales/${updatedSale.id}`);
    }
  };

  const deleteSale = async (id: string) => {
    const saleToDelete = sales.find(s => s.id === id);
    if (!saleToDelete) return;

    if (window.confirm(`Voulez-vous supprimer cette vente ?\n\nProduit: ${saleToDelete.productName}\nQuantité: ${saleToDelete.quantity}\n\nLe stock sera automatiquement restitué (+${saleToDelete.quantity} unités).`)) {
      try {
        const productRef = doc(db, 'products', saleToDelete.productId);
        const productDoc = products.find(p => p.id === saleToDelete.productId);
        if (productDoc) {
          await updateDoc(productRef, {
            quantity: productDoc.quantity + saleToDelete.quantity
          });
        }
        await deleteDoc(doc(db, 'sales', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `sales/${id}`);
      }
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const deleteOrder = async (id: string) => {
    if (window.confirm('Voulez-vous supprimer cette commande de l\'historique ?')) {
      try {
        await deleteDoc(doc(db, 'orders', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
      }
    }
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newTotal = existing.quantity + quantity;
        if (newTotal > product.quantity) {
           return prev.map(item => 
            item.product.id === product.id ? { ...item, quantity: product.quantity } : item
          );
        }
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: newTotal } : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.quantity) }];
    });
    setIsCartOpen(false); // Ensure it doesn't open automatically
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, Math.min(item.product.quantity, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = async (customerInfo: { firstName: string; lastName: string; contact?: string; address?: string }) => {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const orderId = 'IC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    setLastOrder({
      items: [...cart],
      total,
      orderId,
      customerInfo
    });

    // Record the order in the admin space
    const newOrder: Order = {
      id: Date.now().toString() + Math.random(),
      orderId,
      items: [...cart],
      total,
      customerInfo: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        contact: customerInfo.contact,
        address: customerInfo.address
      },
      status: OrderStatus.PENDING,
      date: new Date().toISOString()
    };
    
    try {
      const { id, ...data } = newOrder;
      await setDoc(doc(db, 'orders', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'orders');
    }

    // We no longer automatically reduce stock or record sales here
    // as per user request to record them manually.

    const itemsList = cart.map(item => `- ${item.product.name} (x${item.quantity})`).join('\n');
    
    let customerDetails = `Client : ${customerInfo.firstName} ${customerInfo.lastName}`;
    if (customerInfo.contact) customerDetails += `\nContact : ${customerInfo.contact}`;
    if (customerInfo.address) customerDetails += `\nAdresse : ${customerInfo.address}`;

    const isMultiple = cart.length > 1 || (cart.length === 1 && cart[0].quantity > 1);
    const productWord = isMultiple ? 'ces produits' : 'ce produit';
    const availabilityQuestion = isMultiple ? 'Sont-ils disponibles ?' : 'Est-il disponible ?';

    const text = `Bonjour IbraCosm,\n\n${customerDetails}\n\nJe souhaiterais commander ${productWord} (Commande #${orderId}) :\n\n${itemsList}\n\nTotal à payer : ${total.toLocaleString()} FCFA\n\n${availabilityQuestion} Merci !`;
    const url = `https://wa.me/22396406129?text=${encodeURIComponent(text)}`;
    
    window.open(url, '_blank');
    
    setCart([]);
    setIsCartOpen(false);
    setCurrentView(View.ORDER_CONFIRMATION);
  };

  const handleAdminLogin = (password: string) => {
    if (password === 'Ibra777') {
      setIsAdmin(true);
      sessionStorage.setItem('ibra_admin', 'true');
      setIsLoginOpen(false);
      return true;
    }
    return false;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
    setIsAdmin(false);
    sessionStorage.removeItem('ibra_admin');
    setCurrentView(View.SHOP);
  };

  return (
    <AppErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Navbar 
          currentView={currentView} 
          setView={setCurrentView} 
          isAdmin={isAdmin} 
          onLoginClick={() => setIsLoginOpen(true)}
          onLogout={handleLogout}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          onCartClick={() => setIsCartOpen(true)}
        />
        
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          {currentView === View.SHOP && (
            <Shop products={products} onAddToCart={addToCart} />
          )}
          
          {isAdmin && currentView === View.ADMIN_INVENTORY && (
            <InventoryManager 
              products={products} 
              onAdd={addProduct} 
              onUpdate={updateProduct}
              onDelete={deleteProduct} 
            />
          )}
          
          {isAdmin && currentView === View.ADMIN_STATS && (
            <StatsDashboard 
              products={products} 
              sales={sales} 
              orders={orders}
              onAddSale={addSale}
              onUpdateSale={updateSale}
              onDeleteSale={deleteSale}
              onUpdateOrderStatus={updateOrderStatus}
              onDeleteOrder={deleteOrder}
            />
          )}

          {currentView === View.ORDER_CONFIRMATION && lastOrder && (
            <OrderConfirmation 
              order={lastOrder} 
              onBackToShop={() => {
                setLastOrder(null);
                setCurrentView(View.SHOP);
              }} 
            />
          )}

          {!isAdmin && (currentView === View.ADMIN_INVENTORY || currentView === View.ADMIN_STATS) && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-stone-800">Accès Restreint</h2>
              <p className="text-stone-500 mt-2">Veuillez vous connecter en tant qu'administrateur pour voir cette page.</p>
              <button 
                onClick={() => setCurrentView(View.SHOP)}
                className="mt-6 text-rose-600 font-bold underline"
              >
                Retour à la boutique
              </button>
            </div>
          )}
        </main>

        <CartModal 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          items={cart}
          onRemove={removeFromCart}
          onUpdateQty={updateCartQuantity}
          onCheckout={handleCheckout}
        />

        <AdminLoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)} 
          onLogin={handleAdminLogin} 
        />

        <footer className="bg-stone-900 text-stone-400 py-10 mt-12 border-t border-stone-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="brand-font text-2xl text-white mb-4">IbraCosm</h2>
            <p className="mb-6">L'élégance à portée de main au Mali.</p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
              <a href="https://wa.me/22396406129" className="hover:text-white transition-colors">WhatsApp</a>
            </div>
            <p className="mt-8 text-xs">&copy; 2024 IbraCosm. Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    </AppErrorBoundary>
  );
};

export default App;
