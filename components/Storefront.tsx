import React, { useState } from 'react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { getGiftSuggestion } from '../services/geminiService';
import { SearchIcon, SparklesIcon, WhatsappIcon, ShoppingBagIcon } from './Icons';
import { WHATSAPP_NUMBER } from '../constants';

interface StorefrontProps {
  products: Product[];
  cart: Product[];
  onToggleCart: (product: Product) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({ products, cart, onToggleCart }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');
  const [aiQuery, setAiQuery] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const filteredProducts = selectedCategory === 'Todos' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handleAiSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsSuggesting(true);
    setAiSuggestion(null);

    // Create a mini-context of available items for the AI
    const productContext = products.map(p => `${p.name} (${p.category}) - R$${p.price}`).join(', ');
    
    const suggestion = await getGiftSuggestion(aiQuery, productContext);
    setAiSuggestion(suggestion);
    setIsSuggesting(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let message = "Olá Josi! Selecionei os seguintes itens no seu site:\n\n";
    cart.forEach(item => {
      message += `- ${item.name} (R$ ${item.price.toFixed(2)})\n`;
    });
    message += `\n*Total Estimado: R$ ${cartTotal.toFixed(2)}*\n\nGostaria de saber mais sobre prazos e detalhes de encomenda.`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="pb-32"> {/* Extra padding bottom for floating bar */}
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-rose-100 via-rose-50 to-orange-50 py-20 px-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block mb-4 px-4 py-1 bg-white/60 backdrop-blur-sm rounded-full text-rose-600 text-sm font-semibold tracking-wide border border-rose-100 shadow-sm animate-fade-in">
            ✨ Feito à mão com amor
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-rose-900 mb-6 leading-tight">
            Artes e Bordados
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Transformando momentos em memórias com presentes personalizados e bolos deliciosos feitos pela Josi.
          </p>
        </div>
      </div>

      {/* AI Assistant Section */}
      <div className="max-w-3xl mx-auto -mt-8 px-4 relative z-20 mb-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-rose-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <SparklesIcon className="text-rose-500 w-5 h-5" />
            Precisa de ajuda para escolher um presente?
          </h3>
          <form onSubmit={handleAiSuggestion} className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ex: Procuro algo para uma amiga que ama chá e coisas fofas..."
              className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={isSuggesting}
              className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-70 flex justify-center items-center shadow-md hover:shadow-lg"
            >
              {isSuggesting ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></span>
                </span>
              ) : (
                <SearchIcon />
              )}
            </button>
          </form>
          {aiSuggestion && (
            <div className="mt-4 p-4 bg-rose-50 rounded-xl border border-rose-100 text-gray-800 animate-fade-in">
              <p className="font-medium text-rose-900 mb-1 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4" /> Sugestão da Josi (IA):
              </p>
              <p className="text-gray-700 leading-relaxed">{aiSuggestion}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Catalog */}
      <div className="container mx-auto px-4">
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setSelectedCategory('Todos')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === 'Todos' 
                ? 'bg-rose-600 text-white shadow-md transform scale-105' 
                : 'bg-white text-gray-600 hover:bg-rose-50 border border-transparent hover:border-rose-100'
            }`}
          >
            Todos
          </button>
          {Object.values(Category).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat 
                  ? 'bg-rose-600 text-white shadow-md transform scale-105' 
                  : 'bg-white text-gray-600 hover:bg-rose-50 border border-transparent hover:border-rose-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const isSelected = cart.some(item => item.id === product.id);
            return (
              <ProductCard 
                key={product.id} 
                product={product} 
                isSelected={isSelected}
                onToggleSelect={onToggleCart}
              />
            );
          })}
        </div>
        
        {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-gray-500 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-lg">Nenhum produto encontrado nesta categoria no momento.</p>
                <button 
                  onClick={() => setSelectedCategory('Todos')}
                  className="mt-4 text-rose-600 font-medium hover:underline"
                >
                  Ver todos os produtos
                </button>
            </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-2xl bg-white/95 backdrop-blur-md border border-rose-200 shadow-2xl rounded-full p-3 flex items-center justify-between z-50 animate-slide-up">
          <div className="flex items-center gap-4 pl-2">
            <div className="bg-rose-100 text-rose-700 p-3 rounded-full relative">
              <ShoppingBagIcon className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] min-w-[20px] h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                {cart.length}
              </span>
            </div>
            <div className="hidden xs:block">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Estimado</p>
              <p className="text-lg font-bold text-rose-900 leading-none">R$ {cartTotal.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
          >
            <WhatsappIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Finalizar Pedido</span>
            <span className="sm:hidden">Enviar</span>
          </button>
        </div>
      )}
    </div>
  );
};