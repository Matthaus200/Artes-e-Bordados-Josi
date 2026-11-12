/**
 * Categoria criada pela Josi no painel.
 *
 * Antes isto era um enum fixo no código: para ter uma categoria nova era
 * preciso editar o arquivo e publicar o site. Agora vive no Firestore.
 */
export interface Categoria {
  id: string;
  nome: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  /**
   * O NOME da categoria, não o id dela. Guardar o nome evita migrar os
   * produtos que já existiam e mantém o documento legível sozinho. Em troca,
   * renomear uma categoria desgarraria os produtos — por isso o painel só
   * oferece criar e excluir, e bloqueia a exclusão de categoria em uso.
   */
  category: string;
  /** Capa do produto, em versão reduzida. É o que a vitrine carrega na grade. */
  imageUrl: string;
  /** Quantas fotos existem na subcoleção. Serve para a grade saber se há galeria. */
  fotos?: number;
}

/** Foto da galeria de um produto. Vive em produtos/{id}/fotos/{fotoId}. */
export interface Foto {
  id: string;
  dados: string;
  ordem: number;
}

export type ViewState = 'HOME' | 'ADMIN' | 'PRIVACY';
