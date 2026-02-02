import React, { useState } from 'react';
import { Product, Category } from '../types';
import { generateProductDescription } from '../services/geminiService';
import { PlusIcon, SparklesIcon, TrashIcon, SearchIcon, EditIcon, CheckIcon } from './Icons';

interface AdminPanelProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct, onLogout }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: Category.OUTROS,
    imageUrl: '',
    description: ''
  });
  const [imageError, setImageError] = useState(false);

  const handleGenerateDescription = async () => {
    if (!newProduct.name || !newProduct.category) {
      alert("Por favor, preencha o nome e a categoria antes de gerar a descrição.");
      return;
    }
    
    setIsGenerating(true);
    const desc = await generateProductDescription(
      newProduct.name, 
      newProduct.category, 
      newProduct.description || "Feito com amor."
    );
    setNewProduct(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      description: product.description
    });
    setImageError(false);
    // Scroll to top to see form on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewProduct({
      name: '',
      price: 0,
      category: Category.OUTROS,
      imageUrl: '',
      description: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    if (editingId) {
      // Update existing
      const updatedProduct: Product = {
        id: editingId,
        name: newProduct.name,
        price: Number(newProduct.price),
        category: newProduct.category as Category,
        imageUrl: newProduct.imageUrl || `https://picsum.photos/400/400?random=${Date.now()}`,
        description: newProduct.description || ''
      };
      onUpdateProduct(updatedProduct);
      alert("Produto atualizado com sucesso!");
    } else {
      // Create new
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        price: Number(newProduct.price),
        category: newProduct.category as Category,
        imageUrl: newProduct.imageUrl || `https://picsum.photos/400/400?random=${Date.now()}`,
        description: newProduct.description || ''
      };
      onAddProduct(product);
      alert("Produto adicionado com sucesso!");
    }

    // Reset form
    handleCancelEdit();
  };

  const confirmDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-rose-100 pb-6">
        <div>
          <h2 className="text-3xl font-serif text-rose-900">Painel da Josi</h2>
          <p className="text-rose-600">Adicione novos itens, edite ou remova os antigos.</p>
        </div>
        <button 
          onClick={onLogout} 
          className="px-4 py-2 text-sm font-medium text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors shadow-sm"
        >
          Sair do Painel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Form (Sticky on Desktop only) */}
        <div className={`lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg border lg:sticky lg:top-24 z-10 transition-colors ${editingId ? 'border-amber-200 ring-4 ring-amber-50' : 'border-rose-100'}`}>
          <div className="flex justify-between items-center mb-6 border-b border-rose-50 pb-4">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${editingId ? 'text-amber-700' : 'text-gray-800'}`}>
              {editingId ? <EditIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5 text-rose-500" />}
              {editingId ? 'Editar Produto' : 'Adicionar Novo Item'}
            </h3>
            {editingId && (
              <button 
                onClick={handleCancelEdit}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Cancelar
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none placeholder-gray-400"
                placeholder="Ex: Bolo de Cenoura"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price || ''}
                  onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none placeholder-gray-400"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  {Object.values(Category).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
              <input
                type="url"
                value={newProduct.imageUrl}
                onChange={e => {
                  setNewProduct({...newProduct, imageUrl: e.target.value});
                  setImageError(false);
                }}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm placeholder-gray-400"
                placeholder="https://..."
              />
              {newProduct.imageUrl && (
                <div className="mt-2 relative h-32 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                   <img 
                      src={newProduct.imageUrl} 
                      alt="Prévia" 
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                    {imageError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs">Imagem inválida</div>
                    )}
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                  className="text-xs flex items-center gap-1 text-rose-600 font-bold hover:text-rose-800 disabled:opacity-50"
                >
                  <SparklesIcon className="w-3 h-3" />
                  {isGenerating ? 'Criando...' : 'Criar com IA'}
                </button>
              </div>
              <textarea
                value={newProduct.description}
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none h-20 text-sm placeholder-gray-400"
                placeholder="Detalhes..."
              />
            </div>

            <button
              type="submit"
              className={`w-full text-white py-3 rounded-lg font-bold transition shadow-md flex justify-center items-center gap-2 ${
                editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {editingId ? <CheckIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
              {editingId ? 'Salvar Alterações' : 'Adicionar Produto'}
            </button>
          </form>
        </div>

        {/* Right Column: Existing Items List */}
        <div className="lg:col-span-2 space-y-4">
           {/* Search & Stats */}
           <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
             <div className="relative w-full sm:w-64">
               <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
               <input 
                  type="text" 
                  placeholder="Buscar produto..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-200 placeholder-gray-400"
               />
             </div>
             <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
                {products.length} itens cadastrados
             </div>
           </div>

           {/* List Items */}
           <div className="grid gap-3">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className={`bg-white p-3 rounded-xl shadow-sm border transition-all flex items-center gap-4 group ${
                      editingId === product.id ? 'border-amber-400 bg-amber-50' : 'border-rose-50 hover:border-rose-200'
                    }`}
                  >
                    {/* Image Thumbnail */}
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900 truncate pr-2">{product.name}</h4>
                          <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium inline-block mb-1">
                            {product.category}
                          </span>
                        </div>
                        <span className="font-bold text-rose-600 whitespace-nowrap ml-2">
                          R$ {product.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1 max-w-md">
                        {product.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => handleEditClick(product)}
                        className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                          editingId === product.id 
                            ? 'bg-amber-200 text-amber-800' 
                            : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                        title="Editar produto"
                        type="button"
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setProductToDelete(product)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Excluir produto"
                        type="button"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-dashed border-gray-300 text-center text-gray-400">
                  <p>Nenhum produto encontrado.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Produto?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Tem certeza que deseja apagar <strong>"{productToDelete.name}"</strong>? Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setProductToDelete(null)}
                className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium shadow-md flex items-center justify-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};