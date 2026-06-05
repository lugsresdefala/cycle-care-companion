import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-sm.webp";
import JsonLd from "@/components/JsonLd";
import { PageMeta } from "@/components/PageMeta";

const PRIVACY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://idcalc.com/privacidade",
  "url": "https://idcalc.com/privacidade",
  "name": "Política de Privacidade — IDALIA Calc",
  "description": "Política de Privacidade da plataforma IDALIA Calc, em conformidade com a LGPD (Lei nº 13.709/2018).",
  "isPartOf": { "@id": "https://idcalc.com/#website" },
  "inLanguage": "pt-BR",
  "dateModified": "2026-03-28"
};

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Política de Privacidade"
        description="Saiba como o IDALIA Calc coleta, usa e protege seus dados. Nossa política de privacidade garante transparência no tratamento de informações de saúde."
        path="/privacidade"
      />
      <JsonLd data={PRIVACY_SCHEMA as Record<string, unknown>} />
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-2xl shadow-nav">
        <div className="container max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="IDALIA" className="w-7 h-7 rounded-full object-cover" />
            <span className="font-display text-sm font-semibold text-foreground">Política de Privacidade</span>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 prose prose-sm prose-neutral dark:prose-invert">
        <h1 className="font-display text-2xl font-semibold text-foreground">Política de Privacidade</h1>
        <p className="text-xs text-muted-foreground">Última atualização: 28 de março de 2026</p>

        <h2>1. Introdução</h2>
        <p>
          A presente Política de Privacidade descreve como a IDALIA Calc coleta, utiliza, armazena e protege os dados
          pessoais dos usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) e
          demais normas aplicáveis.
        </p>

        <h2>2. Dados Coletados</h2>
        <h3>2.1 Dados de cadastro</h3>
        <p>
          Nome completo, endereço de e-mail, CRM/registro profissional, especialidade e telefone, fornecidos
          voluntariamente no momento do registro.
        </p>
        <h3>2.2 Dados clínicos inseridos</h3>
        <p>
          Medidas biométricas, parâmetros de Doppler e informações de pacientes cadastrados pelo profissional.
          <strong> Esses dados são tratados exclusivamente para fins de cálculo e registro de histórico clínico.</strong>
        </p>
        <h3>2.3 Dados de uso</h3>
        <p>
          Informações técnicas como tipo de navegador, endereço IP, páginas acessadas e tempo de sessão, coletados
          automaticamente para fins de melhoria do serviço e segurança.
        </p>

        <h2>3. Processamento Local</h2>
        <p>
          Os cálculos realizados pela Plataforma são processados localmente no dispositivo do usuário. Apenas quando o
          usuário opta por criar uma conta e salvar o histórico é que os dados são transmitidos e armazenados em
          servidores seguros.
        </p>

        <h2>4. Finalidade do Tratamento</h2>
        <ul>
          <li>Prestação do serviço de apoio à decisão clínica</li>
          <li>Armazenamento do histórico de exames (mediante opt-in)</li>
          <li>Gestão de conta, assinatura e cobrança</li>
          <li>Comunicação sobre atualizações e novos recursos</li>
          <li>Melhoria contínua da Plataforma</li>
        </ul>

        <h2>5. Compartilhamento de Dados</h2>
        <p>
          Os dados pessoais <strong>não são vendidos, alugados ou compartilhados</strong> com terceiros para fins
          comerciais. O compartilhamento ocorre exclusivamente com:
        </p>
        <ul>
          <li><strong>Stripe</strong> — processamento de pagamentos (nome e e-mail)</li>
          <li><strong>Provedor de infraestrutura</strong> — armazenamento seguro dos dados</li>
          <li><strong>Autoridades competentes</strong> — quando exigido por lei ou ordem judicial</li>
        </ul>

        <h2>6. Segurança</h2>
        <p>
          Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado, destruição,
          perda ou alteração, incluindo criptografia em trânsito (TLS) e em repouso, controle de acesso baseado em
          papéis (RLS) e backups periódicos.
        </p>

        <h2>7. Retenção</h2>
        <p>
          Os dados pessoais são mantidos enquanto a conta estiver ativa ou conforme necessário para cumprimento de
          obrigações legais. Após a exclusão da conta, os dados são removidos em até 30 dias, exceto quando houver
          obrigação legal de retenção.
        </p>

        <h2>8. Direitos do Titular</h2>
        <p>Nos termos da LGPD, você tem direito a:</p>
        <ul>
          <li>Confirmar a existência de tratamento de seus dados</li>
          <li>Acessar, corrigir ou atualizar seus dados pessoais</li>
          <li>Solicitar a eliminação de dados desnecessários ou tratados em desconformidade</li>
          <li>Revogar o consentimento a qualquer momento</li>
          <li>Solicitar a portabilidade dos dados</li>
        </ul>
        <p>
          Para exercer seus direitos, entre em contato pelo e-mail indicado na Plataforma.
        </p>

        <h2>9. Cookies</h2>
        <p>
          A Plataforma utiliza cookies essenciais para manutenção da sessão de autenticação. Não utilizamos cookies de
          rastreamento de terceiros para fins publicitários.
        </p>

        <h2>10. Alterações</h2>
        <p>
          Esta Política pode ser atualizada periodicamente. Recomendamos a revisão periódica deste documento. A data
          da última atualização está indicada no topo desta página.
        </p>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
