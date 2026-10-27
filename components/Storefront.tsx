import React, { useState } from 'react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { WhatsappIcon, ShoppingBagIcon } from './Icons';
import { WHATSAPP_NUMBER } from '../constants';

interface StorefrontProps {
  products: Product[];
  cart: Product[];
  onToggleCart: (product: Product) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({ products, cart, onToggleCart }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');

  const filteredProducts = selectedCategory === 'Todos' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

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
      {/* Hero: o selo do ateliê é o elemento central, não um ícone genérico */}
      <div className="bg-rose-100 px-4 py-14 md:py-20 mb-10 md:mb-14">
        <div className="max-w-2xl mx-auto text-center">
          <img
            src="/logo.webp"
            alt="Selo do ateliê Josi Artes e Bordados"
            width={176}
            height={176}
            className="w-36 h-36 md:w-44 md:h-44 mx-auto mb-8 rounded-full animate-fade-in"
          />
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-rose-900 leading-snug mb-5">
            Bordados, cadernos e canecas feitos à mão
          </h1>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-xl mx-auto">
            Cada peça é personalizada com o nome, as cores e a história de quem vai
            receber. Escolha as suas e envie o pedido pelo WhatsApp.
          </p>
          {/* Fio dourado: eco do anel da logo e do próprio ofício */}
          <div className="mt-10 mx-auto h-px w-28 bg-gold-500" />
        </div>
      </div>

      {/* Main Catalog */}
      <div className="container mx-auto px-4">
        {/* Categories - Horizontal Scroll on Mobile */}
        <div className="flex overflow-x-auto pb-4 gap-2 mb-8 md:mb-10 hide-scrollbar snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center">
          <button
            onClick={() => setSelectedCategory('Todos')}
            className={`flex-shrink-0 snap-center px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
              selectedCategory === 'Todos' 
                ? 'bg-rose-600 text-white shadow-md border-rose-600' 
                : 'bg-white text-gray-600 hover:bg-rose-50 border-gray-200 hover:border-rose-200'
            }`}
          >
            Todos
          </button>
          {Object.values(Category).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 snap-center px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-rose-600 text-white shadow-md border-rose-600' 
                  : 'bg-white text-gray-600 hover:bg-rose-50 border-gray-200 hover:border-rose-200'
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