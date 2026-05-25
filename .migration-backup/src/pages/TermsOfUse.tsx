import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const TermsOfUse = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-2xl shadow-nav">
        <div className="container max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="IDALIA" className="w-7 h-7 rounded-full object-cover" />
            <span className="font-display text-sm font-semibold text-foreground">Termos de Uso</span>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 prose prose-sm prose-neutral dark:prose-invert">
        <h1 className="font-display text-2xl font-semibold text-foreground">Termos de Uso</h1>
        <p className="text-xs text-muted-foreground">Última atualização: 28 de março de 2026</p>

        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e utilizar a plataforma IDALIA Calc ("Plataforma"), você declara ter lido, compreendido e concordado
          integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição, interrompa imediatamente o uso da Plataforma.
        </p>

        <h2>2. Descrição do Serviço</h2>
        <p>
          A IDALIA Calc é uma ferramenta digital de apoio à decisão clínica voltada a profissionais de saúde habilitados,
          que oferece calculadoras de biometria fetal, datação gestacional, Doppler obstétrico e curvas de crescimento,
          fundamentadas em diretrizes internacionais (ISUOG, ACOG, FEBRASGO, Ministério da Saúde).
        </p>

        <h2>3. Natureza dos Resultados</h2>
        <p>
          Os resultados fornecidos pela Plataforma são <strong>estimativas matemáticas</strong> baseadas em modelos estatísticos
          publicados na literatura científica. Eles <strong>não constituem diagnóstico médico</strong>, não substituem a
          avaliação clínica individualizada e não devem ser utilizados como único critério para tomada de decisão terapêutica ou obstétrica.
        </p>

        <h2>4. Público-alvo</h2>
        <p>
          A Plataforma é destinada exclusivamente a profissionais de saúde com formação e habilitação para interpretação dos
          resultados no contexto clínico apropriado. A utilização por pessoas sem qualificação profissional adequada é
          desencorajada e ocorre por conta e risco do usuário.
        </p>

        <h2>5. Cadastro e Conta</h2>
        <p>
          O acesso a funcionalidades avançadas requer a criação de uma conta com informações verídicas. O usuário é responsável
          pela confidencialidade de suas credenciais e por todas as atividades realizadas em sua conta.
        </p>

        <h2>6. Planos e Assinaturas</h2>
        <p>
          A Plataforma disponibiliza planos de assinatura com diferentes níveis de acesso e limites de uso (tokens). Os valores,
          benefícios e condições de cada plano estão descritos na página de preços. A cobrança é processada pelo Stripe, e
          o gerenciamento da assinatura pode ser feito pelo portal do cliente.
        </p>

        <h2>7. Propriedade Intelectual</h2>
        <p>
          Todo o conteúdo da Plataforma — incluindo código-fonte, design, textos, logotipos e algoritmos — é protegido por
          direitos autorais e propriedade intelectual. É proibida a reprodução, distribuição ou engenharia reversa sem
          autorização expressa.
        </p>

        <h2>8. Limitação de Responsabilidade</h2>
        <p>
          A IDALIA Calc não se responsabiliza por danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso
          ou da impossibilidade de uso da Plataforma, incluindo, mas não se limitando a, erros de interpretação de resultados,
          decisões clínicas baseadas exclusivamente nos dados gerados pela ferramenta, ou indisponibilidade do serviço.
        </p>

        <h2>9. Modificações</h2>
        <p>
          Reservamo-nos o direito de alterar estes Termos a qualquer momento. As alterações entrarão em vigor a partir da
          publicação na Plataforma. O uso continuado após a publicação implica aceitação dos novos termos.
        </p>

        <h2>10. Legislação Aplicável</h2>
        <p>
          Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca do domicílio do titular da
          Plataforma para dirimir eventuais controvérsias.
        </p>
      </main>
    </div>
  );
};

export default TermsOfUse;
