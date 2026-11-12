import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Foto } from '../types';

/**
 * Galeria de fotos de um produto.
 *
 * As fotos ficam numa SUBCOLEÇÃO (produtos/{id}/fotos), não dentro do documento
 * do produto. O motivo é o peso: enquanto não existe hospedagem externa de
 * imagem, cada foto é uma data URL em base64 de 120 a 180 KB. Se elas morassem
 * no próprio documento, toda cliente que abrisse a vitrine baixaria todas as
 * fotos de todos os produtos de uma vez — com 20 produtos e 4 fotos cada seriam
 * mais de 10 MB no 4G dela, para ver uma grade.
 *
 * Com a subcoleção, a vitrine lê só os produtos (cada um com a capa reduzida) e
 * as fotos extras só são buscadas quando alguém abre aquele produto.
 *
 * Chamado por: components/AdminPanel.tsx, components/Storefront.tsx e
 * services/productService.ts.
 */

const SUBCOLECAO = 'fotos';

/** Teto por foto. O limite do Firestore é 1 MiB por documento. */
export const LIMITE_POR_FOTO = 900 * 1024;

/** Teto de fotos por produto, para a galeria não virar um álbum infinito. */
export const MAX_FOTOS = 8;

function caminho(produtoId: string) {
  return collection(db, 'produtos', produtoId, SUBCOLECAO);
}

export async function buscarFotos(produtoId: string): Promise<Foto[]> {
  const snap = await getDocs(query(caminho(produtoId), orderBy('ordem')));
  return snap.docs.map((d) => ({
    id: d.id,
    dados: d.data().dados ?? '',
    ordem: d.data().ordem ?? 0,
  }));
}

/**
 * Mantém o contador no documento do produto em sincronia com a subcoleção.
 * Recontar em vez de somar e subtrair custa uma leitura a mais, mas não
 * acumula erro quando alguma gravação falha no meio do caminho.
 */
async function atualizarContagem(produtoId: string): Promise<number> {
  const snap = await getDocs(caminho(produtoId));
  await updateDoc(doc(db, 'produtos', produtoId), { fotos: snap.size });
  return snap.size;
}

export async function adicionarFoto(produtoId: string, dados: string): Promise<void> {
  if (dados.length > LIMITE_POR_FOTO) {
    throw new Error('Esta foto ficou grande demais mesmo depois de comprimida.');
  }

  const existentes = await getDocs(caminho(produtoId));
  if (existentes.size >= MAX_FOTOS) {
    throw new Error(`Cada produto pode ter no máximo ${MAX_FOTOS} fotos.`);
  }

  const proximaOrdem = existentes.docs.reduce(
    (maior, d) => Math.max(maior, (d.data().ordem ?? 0) + 1),
    0
  );

  await addDoc(caminho(produtoId), {
    dados,
    ordem: proximaOrdem,
    criadoEm: serverTimestamp(),
  });

  await atualizarContagem(produtoId);
}

export async function removerFoto(produtoId: string, fotoId: string): Promise<void> {
  await deleteDoc(doc(db, 'produtos', produtoId, SUBCOLECAO, fotoId));
  await atualizarContagem(produtoId);
}

/**
 * Apagar um documento no Firestore NÃO apaga a subcoleção dele: as fotos
 * ficariam órfãs para sempre, invisíveis e ocupando cota. Por isso o produto só
 * é removido depois que isto roda.
 */
export async function removerTodasAsFotos(produtoId: string): Promise<void> {
  const snap = await getDocs(caminho(produtoId));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}
