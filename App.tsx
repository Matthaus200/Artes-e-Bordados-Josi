import React, { useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, WHATSAPP_NUMBER } from './constants';
import { Product, ViewState } from './types';
import { AdminPanel } from './components/AdminPanel';
import { Storefront } from './components/Storefront';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { LockIcon, InstagramIcon, WhatsappIcon } from './components/Icons';

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

  // Save to local storage whenever products change.
  // TEMPORÁRIO: será substituído pelo Firestore. Enquanto as fotos vão para o
  // localStorage em base64, o limite de ~5 MB do navegador pode estourar — e sem
  // este try/catch a Josi perderia o produto recém-cadastrado sem nenhum aviso.
  useEffect(() => {
    try {
      localStorage.setItem('josi_products', JSON.stringify(products));
    } catch (err) {
      console.error('Falha ao salvar produtos no localStorage:', err);
      alert(
        'Não foi possível salvar o produto: o armazenamento do navegador está cheio.\n\n' +
        'As fotos são o que ocupa espaço. Remova algum produto antigo antes de cadastrar outro.'
      );
    }
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
    // ATENÇÃO: esta comparação roda no navegador, então a senha vai em texto
    // puro no arquivo publicado e qualquer visitante consegue lê-la. Isso não
    // protege nada — serve só para a Josi não abrir o painel sem querer.
    // A proteção de verdade entra com o Firebase Auth, que valida no servidor.
    if (passwordInput === 'Engenharia11') {
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

  const renderContent = () => {
    switch (view) {
      case 'ADMIN':
        return (
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
        );
      case 'PRIVACY':
        return <PrivacyPolicy />;
      case 'HOME':
      default:
        return (
          <Storefront 
            products={products} 
            cart={cart}
            onToggleCart={handleToggleCart}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-rose-100 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <button
            onClick={() => setView('HOME')}
            aria-label="Josi Artes e Bordados — ir para o início"
            className="flex items-center gap-3 hover:opacity-80 transition"
          >
            <img
              src="/logo.webp"
              alt=""
              width={40}
              height={40}
              className="w-10 h-10 rounded-full flex-shrink-0 ring-1 ring-gold-300"
            />
            <span className="font-serif text-xl md:text-2xl font-semibold text-rose-700 leading-none">
              Josi<span className="hidden xs:inline"> Artes &amp; Bordados</span>
            </span>
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
            {view !== 'HOME' && (
              <button
                onClick={() => setView('HOME')}
                className="text-sm font-medium text-rose-600 hover:text-rose-800 bg-rose-50 px-4 py-2 rounded-full transition-colors"
              >
                Voltar para Loja
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-rose-50/50">
        {renderContent()}
      </main>

      {/* Professional Footer for Google Ads Compliance */}
      <footer className="bg-rose-900 text-rose-100 pt-12 pb-6 border-t-2 border-gold-500">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
            
            {/* Column 1: Brand */}
            <div>
              <img
                src="/logo.webp"
                alt=""
                width={64}
                height={64}
                className="w-16 h-16 rounded-full mb-4 mx-auto md:mx-0 ring-1 ring-gold-400"
              />
              <h3 className="font-serif text-2xl font-semibold text-gold-300 mb-4">Josi Artes e Bordados</h3>
              <p className="text-rose-200 text-sm leading-relaxed mb-4 max-w-xs mx-auto md:mx-0">
                Transformando sentimentos em presentes únicos. Bordados, encadernação e mimos personalizados feitos à mão.
              </p>
              <div className="flex justify-center md:justify-start gap-4">
                 <a 
                  href="https://instagram.com/josiartesanato81" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Institucional</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => setView('HOME')} className="hover:text-white transition-colors">
                    Catálogo de Produtos
                  </button>
                </li>
                <li>
                  <button onClick={() => setView('PRIVACY')} className="hover:text-white transition-colors">
                    Política de Privacidade
                  </button>
                </li>
                <li>
                  <button onClick={openLogin} className="hover:text-white transition-colors">
                    Acesso Administrativo
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Contato</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <WhatsappIcon className="w-5 h-5 text-green-400" />
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="hover:text-white">
                    (47) 99644-4364
                  </a>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <span className="font-bold">@</span>
                  <a href="mailto:josifp22@gmail.com" className="hover:text-white break-all">
                    josifp22@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-rose-800 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-rose-300">
            <p>&copy; {new Date().getFullYear()} Josi Artes e Bordados - Todos os direitos reservados.</p>
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