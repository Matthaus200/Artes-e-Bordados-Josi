import React, { useEffect, useRef, useState } from 'react';
import { Foto, Product } from '../types';
import { buscarFotos } from '../services/photoService';

interface GaleriaProdutoProps {
  produto: Product;
  onFechar: () => void;
}

/**
 * Galeria de fotos de um produto.
 *
 * As fotos só são buscadas quando a cliente abre este modal. A grade da vitrine
 * carrega apenas a capa de cada produto — se o álbum inteiro viesse junto na
 * listagem, abrir o site custaria vários megabytes no celular dela.
 *
 * Chamado por: components/Storefront.tsx.
 */
export const GaleriaProduto: React.FC<GaleriaProdutoProps> = ({ produto, onFechar }) => {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [atual, setAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const botaoFechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(false);

    buscarFotos(produto.id)
      .then((lista) => {
        if (!ativo) return;
        // A capa vive no documento do produto, não na subcoleção. Ela abre a
        // galeria porque é a imagem que a cliente acabou de ver na grade —
        // começar por outra foto seria desorientador.
        const capa: Foto[] = produto.imageUrl
          ? [{ id: 'capa', dados: produto.imageUrl, ordem: -1 }]
          : [];
        setFotos([...capa, ...lista]);
        setCarregando(false);
      })
      .catch((e) => {
        if (!ativo) return;
        console.error('[Galeria] Falha ao buscar fotos:', e);
        setErro(true);
        setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [produto.id, produto.imageUrl]);

  // Teclado: Esc fecha, setas navegam. Sem isto o modal vira uma armadilha
  // para quem não usa mouse.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
      if (e.key === 'ArrowRight') setAtual((i) => (i + 1) % Math.max(fotos.length, 1));
      if (e.key === 'ArrowLeft') setAtual((i) => (i - 1 + fotos.length) % Math.max(fotos.length, 1));
    };
    window.addEventListener('keydown', aoTeclar);
    botaoFechar.current?.focus();
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [fotos.length, onFechar]);

  // Impede a página de rolar atrás do modal enquanto ele está aberto.
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
    };
  }, []);

  const foto = fotos[atual];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${produto.name}`}
      onClick={onFechar}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-rose-100">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-gray-900 leading-tight">
              {produto.name}
            </h2>
            <p className="text-rose-600 font-bold mt-1">R$ {produto.price.toFixed(2)}</p>
          </div>
          <button
            ref={botaoFechar}
            type="button"
            onClick={onFechar}
            aria-label="Fechar galeria"
            className="text-gray-500 hover:text-gray-800 text-2xl leading-none px-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {carregando && (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Carregando fotos...
            </div>
          )}

          {erro && (
            <div className="h-64 flex items-center justify-center text-center text-gray-600 px-6">
              Não foi possível carregar as fotos. Tente fechar e abrir de novo.
            </div>
          )}

          {!carregando && !erro && foto && (
            <>
              <img
                src={foto.dados}
                alt={`${produto.name} — foto ${atual + 1} de ${fotos.length}`}
                className="w-full max-h-[55vh] object-contain rounded-xl bg-gray-50"
              />

              {fotos.length > 1 && (
                <>
                  <div className="flex items-center justify-between mt-4">
                    <button
                      type="button"
                      onClick={() => setAtual((i) => (i - 1 + fotos.length) % fotos.length)}
                      className="px-4 py-2 text-sm font-medium text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-500">
                      {atual + 1} de {fotos.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAtual((i) => (i + 1) % fotos.length)}
                      className="px-4 py-2 text-sm font-medium text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50"
                    >
                      Próxima
                    </button>
                  </div>

                  <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                    {fotos.map((f, i) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setAtual(i)}
                        aria-label={`Ver foto ${i + 1}`}
                        aria-current={i === atual}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                          i === atual ? 'border-rose-600' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={f.dados} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {produto.description && (
                <p className="text-gray-700 leading-relaxed mt-5 whitespace-pre-line">
                  {produto.description}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
