import { createClient } from "@/lib/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TodoList } from "./_components/ToDoList";
import { ListaMetas } from "./_components/ListaMetas";
import GraficoEventos from "./_components/GraficoEventos";
import GraficoDesempenhoDisciplina from "./_components/GraficoDesempenhoDisciplina";

export default async function RelatoriosPage() {
  const supabase = createClient();

  // Obter usuário logado
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Total de quizzes
  const { count: totalQuizzesUsuario } = await supabase
    .from("Quiz")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Total de enquetes
  const { count: totalEnquetesUsuario } = await supabase
    .from("Enquete")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Total de planos de aula
  const { count: totalPlanosUsuario } = await supabase
    .from("PlanoAula")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Total de votos em enquetes
  const { count: totalVotos } = await supabase
    .from("respostas_enquete")
    .select("*", { count: "exact", head: true });

  // Total de respostas em quizzes
  const { count: totalRespostasQuiz } = await supabase
    .from("Resposta")
    .select("*", { count: "exact", head: true });

  // Total de acertos em quizzes
  const { count: totalAcertosQuiz } = await supabase
    .from("Resposta")
    .select("*", { count: "exact", head: true })
    .eq("correta", true); // corrigido: coluna se chama "correta"

  // Eventos (para agrupamento por prioridade)
  const { data: eventos, error: eventosErro } = await supabase
    .from("Evento")
    .select("prioridade");

  const eventosAgrupados = (eventos || []).reduce((acc, evento) => {
    const prioridade = evento.prioridade || "Sem Prioridade";
    acc[prioridade] = (acc[prioridade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosEventos = Object.entries(eventosAgrupados).map(([prioridade, quantidade]) => ({
    prioridade,
    quantidade,
  }));

  // Desempenho por disciplina
  const { data: desempenhoDisciplinas } = await supabase
    .from("dashboard_resumo")
    .select("disciplina, percentual_acerto_geral");

  const dadosDesempenho = (desempenhoDisciplinas || []).map((d) => ({
    disciplina: d.disciplina,
    taxa_acerto: parseFloat(d.percentual_acerto_geral),
  }));

  // Cálculos
  const respostasQuiz = totalRespostasQuiz ?? 0;
  const acertosQuiz = totalAcertosQuiz ?? 0;
  const taxaAcertosGeral = respostasQuiz > 0 ? (acertosQuiz / respostasQuiz) * 100 : 0;

  const participacao =
    totalEnquetesUsuario && totalEnquetesUsuario > 0
      ? Math.min(Math.round(((totalVotos ?? 0) / totalEnquetesUsuario) * 100), 100)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Card><TodoList /></Card>

      <Card>
        <ListaMetas
          dados={{
            quizzes: totalQuizzesUsuario ?? 0,
            planos: totalPlanosUsuario ?? 0,
            enquetes: totalEnquetesUsuario ?? 0,
            respostas_enquete: totalVotos ?? 0,
            respostas_quiz: totalRespostasQuiz ?? 0,
          }}
        />
      </Card>

      <Card>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Seus Planos de Aula Criados</h2>
          <div className="text-5xl font-bold text-center text-green-600">{totalPlanosUsuario}</div>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Taxa de Acerto Geral nos Quizzes</h2>
          <div className="text-5xl font-bold text-center text-green-600">
            {taxaAcertosGeral.toFixed(2)}%
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Eventos por Prioridade</h2>
          <div className="w-full max-w-[300px] mx-auto">
            <GraficoEventos dados={dadosEventos} />
          </div>
        </div>
      </Card>

   <Card>
  <div className="p-4">
    <h2 className="text-xl font-bold mb-4">Desempenho por Disciplina</h2>
    <div className="w-full max-w-[600px] h-[400px] mx-auto">
      <GraficoDesempenhoDisciplina dados={dadosDesempenho} />
    </div>
  </div>
</Card>


    </div>
  );
}
