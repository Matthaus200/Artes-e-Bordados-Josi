import React from 'react';
import { Product } from '../types';
import { WhatsappIcon, CheckIcon, PlusIcon } from './Icons';
import { WHATSAPP_NUMBER } from '../constants';

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isAdmin, 
  onDelete, 
  isSelected, 
  onToggleSelect 
}) => {
  const handleContact = () => {
    const message = `Olá Josi! ❤️ Gostei muito do produto "${product.name}" (R$ ${product.price.toFixed(2)}) que vi no site. Gostaria de saber mais detalhes.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border flex flex-col h-full ${
        isSelected ? 'border-rose-500 ring-1 ring-rose-500' : 'border-rose-100'
      }`}
    >
      <div className="h-48 overflow-hidden bg-gray-100 relative group">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.category && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
            {product.category}
          </span>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-serif font-bold text-gray-900 mb-1 leading-tight">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-4 flex-grow line-clamp-3">{product.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-rose-600">
            R$ {product.price.toFixed(2)}
          </span>
          
          {/* Direct WhatsApp Contact Button */}
          {!isAdmin && (
            <button
              onClick={handleContact}
              className="text-gray-400 hover:text-green-600 transition-colors p-1"
              title="Tirar dúvida no WhatsApp"
            >
              <WhatsappIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="pt-3 border-t border-rose-50">
          {isAdmin ? (
            <button 
              onClick={() => onDelete?.(product.id)}
              className="w-full text-red-500 hover:text-red-700 text-sm font-medium px-3 py-2 rounded border border-red-200 hover:bg-red-50 transition-colors"
            >
              Remover
            </button>
          ) : (
            <button 
              onClick={() => onToggleSelect?.(product)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                isSelected 
                  ? 'bg-rose-600 text-white shadow-inner transform scale-[0.98]' 
                  : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 hover:shadow-sm'
              }`}
            >
              {isSelected ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Selecionado
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" />
                  Adicionar ao Carrinho
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};