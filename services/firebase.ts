import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Inicialização do Firebase.
 *
 * Estes valores NÃO são segredo. A config web do Firebase vai no bundle por
 * design: ela identifica o projeto, não autoriza nada. Quem protege os dados
 * são as regras do Firestore (firestore.rules) somadas ao Auth, que rodam no
 * servidor do Google. É o oposto de uma chave de API de serviço pago, que
 * jamais pode ir para o navegador.
 *
 * Mesmo assim ficam em variáveis de ambiente, para o mesmo código servir a
 * outro projeto (um de testes, por exemplo) sem recompilar nada à mão.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Sem isto, uma variável esquecida vira um erro obscuro do SDK lá na frente,
 * já dentro de uma chamada de rede. Falhar aqui aponta direto para a causa.
 */
export const variaveisFaltando = Object.entries(firebaseConfig)
  .filter(([, valor]) => !valor)
  .map(([chave]) => chave);

export const firebaseConfigurado = variaveisFaltando.length === 0;

if (!firebaseConfigurado) {
  console.error(
    '[Firebase] Configuração incompleta. Faltam estas variáveis de ambiente:\n' +
      variaveisFaltando.map((v) => `  - ${v}`).join('\n') +
      '\n\nLocalmente: copie o .env.example para .env e preencha.' +
      '\nNa Vercel: Settings > Environment Variables.'
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
