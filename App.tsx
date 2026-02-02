import React, { useState, useEffect } from 'react';
import { INITIAL_PRODUCTS } from './constants';
import { Product, ViewState } from './types';
import { AdminPanel } from './components/AdminPanel';
import { Storefront } from './components/Storefront';
import { LockIcon, ShoppingBagIcon, InstagramIcon } from './components/Icons';

function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  
  // Login states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Load products from local storage or constants
  useEffect(() => {
    const savedProducts = localStorage.getItem('josi_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
    }
  }, []);

  // Save to local storage whenever products change
  useEffect(() => {
    // Removed the check for length > 0 so we can save empty lists too
    localStorage.setItem('josi_products', JSON.stringify(products));
  }, [products]);

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    // Also update cart if the item is in there to reflect price/name changes
    setCart(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: string) => {
    // Confirmation is now handled in AdminPanel for better UI feedback
    setProducts(prev => prev.filter(p => p.id !== id));
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Matthaus11$') {
      setIsAdminLoggedIn(true);
      setShowLoginModal(false);
      setView('ADMIN');
      setPasswordInput('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const openLogin = () => {
    if (isAdminLoggedIn) {
      setView('ADMIN');
    } else {
      setShowLoginModal(true);
      setLoginError(false);
      setPasswordInput('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-rose-100 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <button 
            onClick={() => setView('HOME')}
            className="flex items-center gap-2 text-2xl font-serif font-bold text-rose-600 hover:opacity-80 transition"
          >
            <ShoppingBagIcon className="w-8 h-8" />
            Ateliê da Josi
          </button>

          <div className="flex items-center gap-4">
            {view === 'HOME' && (
              <button 
                onClick={openLogin}
                className="text-gray-400 hover:text-rose-500 transition-colors p-2"
                title="Área Administrativa"
              >
                <LockIcon className="w-5 h-5" />
              </button>
            )}
            {view === 'ADMIN' && (
              <button
                onClick={() => setView('HOME')}
                className="text-sm font-medium text-rose-600 hover:text-rose-800"
              >
                Voltar para Loja
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-rose-50/50">
        {view === 'HOME' ? (
          <Storefront 
            products={products} 
            cart={cart}
            onToggleCart={handleToggleCart}
          />
        ) : (
          <AdminPanel 
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onLogout={() => {
              setIsAdminLoggedIn(false);
              setView('HOME');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-rose-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="font-serif text-xl mb-2">Ateliê da Josi</p>
          <p className="text-rose-200 text-sm mb-4">Feito com amor e carinho em cada detalhe.</p>
          
          <div className="flex justify-center mb-6">
            <a 
              href="https://instagram.com/josiartesanato81" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 text-rose-100 hover:text-white bg-rose-800/50 hover:bg-rose-800 px-4 py-2 rounded-full transition-all duration-300"
            >
              <InstagramIcon className="w-5 h-5" />
              <span className="font-medium">@josiartesanato81</span>
            </a>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="text-xs text-rose-300/60">
              &copy; {new Date().getFullYear()} Todos os direitos reservados.
            </div>
            <button 
              onClick={openLogin}
              className="text-rose-300/40 hover:text-rose-100 text-[10px] uppercase tracking-wider transition-colors"
            >
              Acesso Restrito (Admin)
            </button>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-serif font-bold text-rose-900 mb-2">Olá, Josi! ❤️</h3>
            <p className="text-gray-500 text-sm mb-6">Digite sua senha para gerenciar seus produtos.</p>
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 transition ${
                    loginError 
                      ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                      : 'border-gray-200 focus:ring-rose-200 bg-gray-50'
                  }`}
                  placeholder="Senha de acesso"
                  autoFocus
                />
                {loginError && (
                  <p className="text-red-500 text-xs mt-2 pl-1">Senha incorreta. Tente novamente.</p>
                )}
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition text-sm font-medium shadow-md"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;