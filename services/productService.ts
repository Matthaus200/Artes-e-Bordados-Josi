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

/**
 * Importa, uma única vez, os produtos que ficaram presos no localStorage.
 *
 * Sem isto a Josi abriria o site novo com o catálogo vazio e teria que digitar
 * tudo de novo. Só roda quando o Firestore está vazio E existe algo salvo no
 * navegador — nos outros casos não aparece nem como opção.
 */
export function produtosGuardadosNoNavegador(): Product[] {
  try {
    const bruto = localStorage.getItem('josi_products');
    if (!bruto) return [];
    const lista = JSON.parse(bruto);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export async function importarDoNavegador(produtos: Product[]): Promise<number> {
  let importados = 0;
  // Sequencial de propósito: são poucas dezenas de itens, e em caso de falha no
  // meio o que já entrou está salvo, em vez de um lote inteiro perdido.
  for (const p of produtos) {
    await adicionarProduto({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      imageUrl: p.imageUrl,
    });
    importados++;
  }
  return importados;
}
