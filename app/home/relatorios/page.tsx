import { createClient } from "@/lib/utils/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { TodoList } from "./_components/ToDoList";
import { ListaMetas } from "./_components/ListaMetas";
import GraficoEventos from "./_components/GraficoEventos";
import GraficoDesempenhoDisciplina from "./_components/GraficoDesempenhoDisciplina";
import { FaChartBar, FaGraduationCap, FaTrophy } from "react-icons/fa";

export default async function RelatoriosPage() {
  const supabase = createClient();

  // Obter usuário logado
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    console.error("Erro ao obter usuário logado:", userError);
    // Tratar usuário não logado ou erro
    return <div>Erro ao carregar dados do usuário.</div>;
  }
  const userId = userData.user.id;

  // Total de quizzes do usuário
  const { count: totalQuizzesUsuario } = await supabase
    .from("Quiz")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Total de diários de aula do usuário
  const { count: totalPlanosUsuario } = await supabase
    .from("PlanoAula")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Obter quizzes do usuário para pegar IDs
  const { data: quizzesDoUsuario, error: quizError } = await supabase
    .from("Quiz")
    .select("id")
    .eq("user_id", userId);

  if (quizError) {
    console.error("Erro ao buscar quizzes do usuário:", quizError.message);
  }

  const quizIds = quizzesDoUsuario?.map((q) => q.id) ?? [];

  let totalRespostasQuiz = 0;
  let totalAcertosQuiz = 0;

  if (quizIds.length > 0) {
    // Total de respostas dos quizzes do usuário
    const { count: respostasCount, error: respostasError } = await supabase
      .from("Resposta")
      .select("*", { count: "exact", head: true })

    if (respostasError) {
      console.error("Erro ao contar respostas:", respostasError.message);
    } else {
      totalRespostasQuiz = respostasCount ?? 0;
    }

    // Total de respostas corretas dos quizzes
    const { count: acertosCount, error: acertosError } = await supabase
      .from("Resposta")
      .select("*", { count: "exact", head: true })
      .eq("correta", true);

    if (acertosError) {
      console.error("Erro ao contar acertos:", acertosError.message);
    } else {
      totalAcertosQuiz = acertosCount ?? 0;
    }
  }

  // Eventos para agrupamento por prioridade
  const { data: eventos, error: eventosErro } = await supabase
    .from("Evento")
    .select("prioridade");

  if (eventosErro) {
    console.error("Erro ao buscar eventos:", eventosErro.message);
  }

  const eventosAgrupados = (eventos ?? []).reduce<Record<string, number>>(
    (acc, evento) => {
      const prioridade = evento.prioridade ?? "Sem Prioridade";
      acc[prioridade] = (acc[prioridade] || 0) + 1;
      return acc;
    },
    {}
  );

  const dadosEventos = Object.entries(eventosAgrupados).map(
    ([prioridade, quantidade]) => ({
      prioridade,
      quantidade,
    })
  );

  
  // Desempenho por disciplina
  const { data: desempenhoDisciplinas, error: desempenhoError } = await supabase
  .from("vw_desempenho_por_disciplina_usuario")
  .select("disciplina, percentual_acerto_geral")
  .eq("user_id", userId);

  if (desempenhoError) {
    console.error("Erro ao buscar desempenho:", desempenhoError.message);
  }

  const dadosDesempenho =
    desempenhoDisciplinas?.map((d) => ({
      disciplina: d.disciplina,
      taxa_acerto: parseFloat(d.percentual_acerto_geral),
    })) ?? [];

  // Cálculo da taxa geral de acertos
  const taxaAcertosGeral =
    totalRespostasQuiz > 0
      ? (totalAcertosQuiz / totalRespostasQuiz) * 100
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
              <FaChartBar className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Relatórios
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                Veja dados, desempenho e estatísticas personalizadas.
              </p>
            </div>
          </div>
        </div>

        {/* Grid de Relatórios */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lista de Tarefas */}
            <TodoList />

            {/* Metas */}
            <ListaMetas
              dados={{
                quizzes: totalQuizzesUsuario ?? 0,
                diarios: totalPlanosUsuario ?? 0,
              }}
            />

            {/* Diário de Aula */}
            <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 bg-white dark:bg-gray-800 rounded-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-t-2xl">
                  <div className="flex items-center space-x-3">
                    <FaGraduationCap className="text-white text-2xl" />
                    <h3 className="text-xl font-bold text-white">
                      Diários de Aula
                    </h3>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <div className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                    {totalPlanosUsuario ?? 0}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Diários criados
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Taxa de Acerto */}
            <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-yellow-300 dark:hover:border-yellow-500 bg-white dark:bg-gray-800 rounded-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-t-2xl">
                  <div className="flex items-center space-x-3">
                    <FaTrophy className="text-white text-2xl" />
                    <h3 className="text-xl font-bold text-white">Taxa de Acerto</h3>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <div className="text-6xl font-bold text-yellow-600 dark:text-yellow-400 mb-4">
                    {taxaAcertosGeral.toFixed(1)}%
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Nos quizzes realizados
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Eventos por Prioridade */}
            <GraficoEventos dados={dadosEventos} />

            {/* Desempenho por Disciplina */}
            <GraficoDesempenhoDisciplina dados={dadosDesempenho} />
          </div>
        </div>
      </div>
    </div>
  );
}
