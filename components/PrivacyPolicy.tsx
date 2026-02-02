import React from 'react';
import { WHATSAPP_NUMBER } from '../constants';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-rose-100">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-rose-900 mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-rose text-gray-700 space-y-6">
          <p className="font-medium text-lg">
            A sua privacidade é prioridade no <strong>Ateliê da Josi</strong>. Esta política descreve como tratamos as informações no nosso site <span className="text-rose-600">josiartesebordados.com.br</span>.
          </p>

          <section className="bg-rose-50/50 p-4 rounded-lg border border-rose-100 mb-6">
            <h2 className="text-lg font-bold text-rose-800 mb-2">📌 Aviso Importante: Site de Catálogo</h2>
            <p className="text-sm">
              Este site funciona exclusivamente como uma <strong>vitrine virtual e catálogo</strong> de produtos artesanais. 
              <strong>Não realizamos transações financeiras, não processamos pagamentos e não coletamos dados bancários ou de cartão de crédito</strong> através deste site. 
              Toda a negociação e pagamento são realizados externamente, via contato direto (WhatsApp).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Coleta de Dados Pessoais (LGPD)</h2>
            <p>
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD), informamos que a coleta de dados neste site é mínima e restrita a:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Dados de Contato Voluntários:</strong> Quando você clica nos botões de contato (WhatsApp) ou nos envia um e-mail, temos acesso apenas aos dados que você escolhe compartilhar (como seu número de telefone ou endereço de e-mail) para fins de resposta ao seu orçamento.</li>
              <li><strong>Finalidade:</strong> Esses dados são usados exclusivamente para comunicação sobre os bordados, personalizações e entregas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Cookies e Publicidade (Google Ads)</h2>
            <p>
              Utilizamos cookies e tecnologias semelhantes para melhorar a funcionalidade do site e para fins de marketing.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Google Ads e Analytics:</strong> Utilizamos serviços do Google para exibir anúncios relevantes e entender como os visitantes usam nosso catálogo. O Google pode usar cookies para exibir anúncios com base em suas visitas anteriores a este ou a outros sites.
              </li>
              <li>
                <strong>Controle:</strong> Você pode desativar a publicidade personalizada acessando as <a href="https://myadcenter.google.com/" target="_blank" rel="nofollow" className="text-rose-600 underline">Configurações de Anúncios do Google</a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Compartilhamento de Dados</h2>
            <p>
              <strong>Não vendemos, não alugamos e não compartilhamos</strong> seus dados pessoais com terceiros para fins comerciais. Seus dados de contato permanecem confidenciais entre você e o Ateliê.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Contato do Responsável</h2>
            <p>
              Para dúvidas sobre esta política, orçamentos ou solicitações relacionadas aos seus dados, entre em contato diretamente através dos canais oficiais:
            </p>
            <ul className="list-none mt-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <li className="mb-2 flex items-center gap-2">
                <span className="font-bold text-rose-700">WhatsApp:</span> (47) 99644-4364
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-rose-700">E-mail:</span> josifp22@gmail.com
              </li>
            </ul>
          </section>

          <p className="text-sm text-gray-500 mt-8 pt-4 border-t border-gray-100">
            Atualizado em: <strong>Janeiro de 2025</strong>. Josi Artes e Bordados.
          </p>
        </div>
      </div>
    </div>
  );
};