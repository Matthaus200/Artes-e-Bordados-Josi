import React, { useState, useEffect } from 'react';
import { WHATSAPP_NUMBER } from './constants';
import { Product, ViewState } from './types';
import { observarProdutos, adicionarProduto, atualizarProduto, removerProduto } from './services/productService';
import { observarLogin, entrar, sair, mensagemDeErro } from './services/authService';
import { firebaseConfigurado } from './services/firebase';
import { AdminPanel } from './components/AdminPanel';
import { Storefront } from './components/Storefront';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { LockIcon, InstagramIcon, WhatsappIcon } from './components/Icons';

function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCatalogo, setErroCatalogo] = useState<string | null>(null);

  // Login
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  /**
   * Catálogo em tempo real, vindo do Firestore.
   * Antes isto era localStorage, o que mantinha os produtos presos ao navegador
   * da Josi: as clientes nunca viam o que ela cadastrava.
   */
  useEffect(() => {
    if (!firebaseConfigurado) {
      setCarregando(false);
      setErroCatalogo('O site não está conectado ao banco de dados.');
      return;
    }

    const cancelar = observarProdutos(
      (lista) => {
        setProducts(lista);
        setErroCatalogo(null);
        setCarregando(false);
        // Mantém o carrinho coerente com o catálogo: atualiza preço e nome dos
        // itens escolhidos e descarta os que a Josi tiver removido.
        setCart((anterior) =>
          anterior
            .map((item) => lista.find((p) => p.id === item.id))
            .filter((p): p is Product => Boolean(p))
        );
      },
      () => {
        setCarregando(false);
        setErroCatalogo('Não foi possível carregar os produtos.');
      }
    );

    return cancelar; // sem isto o listener sobrevive ao desmonte e segue gastando leituras
  }, []);

  /**
   * Estado de login vindo do Firebase. Ele restaura a sessão sozinho, então a
   * Josi não precisa digitar a senha a cada visita.
   */
  useEffect(() => {
    if (!firebaseConfigurado) return;
    return observarLogin((usuario) => {
      setIsAdminLoggedIn(Boolean(usuario));
      // Se a sessão caiu ou expirou enquanto ela estava no painel, não deixa a
      // tela administrativa aberta.
      if (!usuario) setView((atual) => (atual === 'ADMIN' ? 'HOME' : atual));
    });
  }, []);

  // As três funções abaixo apenas gravam. Quem atualiza a lista na tela é o
  // onSnapshot acima — por isso elas não mexem em setProducts.
  const handleAddProduct = async (novo: Omit<Product, 'id'>) => {
    await adicionarProduto(novo);
  };

  const handleUpdateProduct = async (produto: Product) => {
    await atualizarProduto(produto);
  };

  const handleDeleteProduct = async (id: string) => {
    await removerProduto(id);
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

  /**
   * Login de verdade: quem confere a senha é o servidor do Firebase. Nenhuma
   * senha existe neste arquivo nem no bundle publicado.
   */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (entrando) return;

    setEntrando(true);
    setLoginError(null);
    try {
      await entrar(emailInput.trim(), passwordInput);
      setShowLoginModal(false);
      setView('ADMIN');
      setEmailInput('');
      setPasswordInput('');
    } catch (erro) {
      setLoginError(mensagemDeErro(erro));
      setPasswordInput('');
    } finally {
      setEntrando(false);
    }
  };

  const handleLogout = async () => {
    await sair();
    setView('HOME');
  };

  const openLogin = () => {
    if (isAdminLoggedIn) {
      setView('ADMIN');
    } else {
      setShowLoginModal(true);
      setLoginError(null);
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
            onLogout={handleLogout}
          />
        );
      case 'PRIVACY':
        return <PrivacyPolicy />;
      case 'HOME':
      default:
        // O catálogo agora vem pela rede, então existem dois estados que antes
        // não existiam: ainda carregando, e falhou. Sem tratá-los, a cliente
        // via uma vitrine vazia e concluía que a Josi não tem produtos.
        if (carregando) {
          return (
            <div className="container mx-auto px-4 py-24 text-center text-gray-500">
              Carregando o catálogo...
            </div>
          );
        }
        if (erroCatalogo) {
          return (
            <div className="container mx-auto px-4 py-24 text-center">
              <p className="text-gray-800 mb-2">{erroCatalogo}</p>
              <p className="text-gray-500 text-sm">
                Tente recarregar a página. Se continuar, fale com a Josi pelo WhatsApp no rodapé.
              </p>
            </div>
          );
        }
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
            <p className="text-gray-500 text-sm mb-6">Entre com seu e-mail e senha para gerenciar seus produtos.</p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 transition ${
                    loginError
                      ? 'border-red-300 focus:ring-red-200 bg-red-50'
                      : 'border-gray-200 focus:ring-rose-200 bg-gray-50'
                  }`}
                  placeholder="E-mail"
                  autoComplete="username"
                  required
                  autoFocus
                />
              </div>

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
                  autoComplete="current-password"
                  required
                />
                {loginError && (
                  <p className="text-red-500 text-xs mt-2 pl-1">{loginError}</p>
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
                  disabled={entrando}
                  className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition text-sm font-medium shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {entrando ? 'Entrando...' : 'Entrar'}
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