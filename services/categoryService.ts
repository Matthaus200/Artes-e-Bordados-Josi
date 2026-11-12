import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Categoria } from '../types';

/**
 * Categorias do catálogo, no Firestore.
 *
 * Antes eram um enum fixo em types.ts: criar uma categoria exigia editar o
 * código e publicar o site. Agora a Josi cria pelo painel.
 *
 * Chamado por: App.tsx (leitura) e components/AdminPanel.tsx (escrita).
 */

const COLECAO = 'categorias';

/** Sugestões do primeiro uso, iguais às do enum que existia antes. */
export const CATEGORIAS_PADRAO = ['Bordados', 'Cadernos', 'Canecas', 'Outros'];

export function observarCategorias(
  aoReceber: (categorias: Categoria[]) => void,
  aoFalhar: (erro: Error) => void
): () => void {
  const consulta = query(collection(db, COLECAO), orderBy('nome'));

  return onSnapshot(
    consulta,
    (snap) => aoReceber(snap.docs.map((d) => ({ id: d.id, nome: d.data().nome ?? '' }))),
    (erro) => {
      console.error('[Firestore] Falha ao observar categorias:', erro);
      aoFalhar(erro);
    }
  );
}

/**
 * Normaliza antes de comparar, para "Bordados" e "bordados " não conviverem
 * como duas categorias diferentes na lista da vitrine.
 */
export function normalizar(nome: string): string {
  return nome.trim().toLocaleLowerCase('pt-BR');
}

export async function adicionarCategoria(
  nome: string,
  existentes: Categoria[]
): Promise<void> {
  const limpo = nome.trim();
  if (!limpo) throw new Error('Digite um nome para a categoria.');
  if (limpo.length > 40) throw new Error('O nome da categoria é muito longo.');

  if (existentes.some((c) => normalizar(c.nome) === normalizar(limpo))) {
    throw new Error(`A categoria "${limpo}" já existe.`);
  }

  await addDoc(collection(db, COLECAO), {
    nome: limpo,
    criadoEm: serverTimestamp(),
  });
}

export async function removerCategoria(id: string): Promise<void> {
  await deleteDoc(doc(db, COLECAO, id));
}
