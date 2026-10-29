import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { app } from './firebase';

// getAuth fica aqui, e não em firebase.ts, para que o SDK de autenticação só
// entre no pacote de quem realmente abre o painel.
const auth = getAuth(app);

/**
 * Autenticação da área administrativa.
 *
 * Antes a verificação era `if (senha === 'texto fixo')` dentro do App.tsx, o
 * que significava que a senha ia em texto puro no bundle publicado e qualquer
 * visitante conseguia lê-la pelo DevTools. Agora quem valida é o servidor do
 * Firebase: a senha nunca passa pelo código nem fica no repositório.
 *
 * Não existe tela de cadastro, e isso é intencional. A conta da Josi foi criada
 * à mão no console do Firebase. Ninguém se registra sozinho e vira administrador.
 *
 * Chamado por: App.tsx.
 */

/**
 * Avisa sempre que o estado de login muda, inclusive no carregamento da página.
 * O Firebase restaura a sessão sozinho, então ela não precisa digitar a senha
 * de novo a cada visita. Devolve a função que cancela a assinatura.
 */
export function observarLogin(aoMudar: (usuario: User | null) => void): () => void {
  return onAuthStateChanged(auth, aoMudar);
}

export async function entrar(email: string, senha: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, senha);
}

export async function sair(): Promise<void> {
  await signOut(auth);
}

/**
 * Traduz o código de erro do Firebase para algo que a Josi entenda.
 *
 * Repare que e-mail inexistente e senha errada caem na MESMA mensagem. Isso é
 * de propósito, e o próprio Firebase já unifica os dois em `invalid-credential`:
 * se as mensagens fossem diferentes, qualquer pessoa poderia descobrir quais
 * e-mails têm conta no projeto testando um por um.
 */
export function mensagemDeErro(erro: unknown): string {
  const codigo =
    typeof erro === 'object' && erro !== null && 'code' in erro
      ? String((erro as { code: unknown }).code)
      : '';

  switch (codigo) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos.';
    case 'auth/invalid-email':
      return 'Esse e-mail não parece válido.';
    case 'auth/user-disabled':
      return 'Esta conta está desativada.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.';
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique a internet e tente de novo.';
    default:
      console.error('[Auth] Erro não mapeado:', erro);
      return 'Não foi possível entrar. Tente de novo em instantes.';
  }
}
