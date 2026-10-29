import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { Category, Product } from '../types';

/**
 * Catálogo no Firestore.
 *
 * Antes os produtos viviam no localStorage, o que significava que só a Josi,
 * só naquele navegador, só naquele aparelho, via o que ela cadastrava. As
 * clientes viam uma lista fixa de exemplo. Aqui o catálogo passa a ser um só,
 * compartilhado.
 *
 * Chamado por: App.tsx (leitura) e components/AdminPanel.tsx (escrita).
 */

const COLECAO = 'produtos';

/** Converte um documento do Firestore no Product que a interface já usa. */
function paraProduto(snap: QueryDocumentSnapshot<DocumentData>): Product {
  const d = snap.data();
  return {
    id: snap.id, // o id do documento É o id do produto; não guardamos um campo duplicado
    name: d.name ?? '',
    description: d.description ?? '',
    price: typeof d.price === 'number' ? d.price : Number(d.price) || 0,
    category: (d.category as Category) ?? Category.OUTROS,
    imageUrl: d.imageUrl ?? '',
  };
}

/**
 * Observa o catálogo em tempo real.
 *
 * onSnapshot em vez de uma leitura única: quando a Josi cadastra um produto no
 * celular, quem estiver com o site aberto vê aparecer sem recarregar. Devolve a
 * função que cancela a assinatura — precisa ser chamada ao desmontar, senão o
 * listener continua vivo e consumindo leituras.
 */
export function observarProdutos(
  aoReceber: (produtos: Product[]) => void,
  aoFalhar: (erro: Error) => void
): () => void {
  const consulta = query(collection(db, COLECAO), orderBy('criadoEm', 'desc'));

  return onSnapshot(
    consulta,
    (snap) => aoReceber(snap.docs.map(paraProduto)),
    (erro) => {
      console.error('[Firestore] Falha ao observar produtos:', erro);
      aoFalhar(erro);
    }
  );
}

export async function adicionarProduto(produto: Omit<Product, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, COLECAO), {
    name: produto.name,
    description: produto.description,
    price: Number(produto.price),
    category: produto.category,
    imageUrl: produto.imageUrl,
    // Carimbo do servidor, não do relógio do celular dela: ordena certo mesmo
    // se o aparelho estiver com a hora errada.
    criadoEm: serverTimestamp(),
  });
  return ref.id;
}

export async function atualizarProduto(produto: Product): Promise<void> {
  // updateDoc e não setDoc: preserva o criadoEm, que não está no tipo Product.
  await updateDoc(doc(db, COLECAO, produto.id), {
    name: produto.name,
    description: produto.description,
    price: Number(produto.price),
    category: produto.category,
    imageUrl: produto.imageUrl,
  });
}

export async function removerProduto(id: string): Promise<void> {
  await deleteDoc(doc(db, COLECAO, id));
}

// Havia aqui uma importação dos produtos presos no localStorage. Removida:
// a Josi ainda não tinha catálogo cadastrado, então não havia nada a migrar.
