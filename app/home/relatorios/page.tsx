import { createClient } from "@/lib/utils/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TodoList } from "./_components/ToDoList";
import { ListaMetas } from "./_components/ListaMetas";
import GraficoEventos from "./_components/GraficoEventos";
import GraficoDesempenhoDisciplina from "./_components/GraficoDesempenhoDisciplina";
import { FaChartBar, FaClipboardList, FaBullseye, FaGraduationCap, FaPoll, FaBookOpen, FaTrophy, FaUsers, FaChartPie } from "react-icons/fa";

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
    .from("enquetes")
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
    .eq("correta", true);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
                <FaChartBar className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard de Relatórios
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Acompanhe suas estatísticas e progresso
                </p>
              </div>
            </div>
            
            {/* Estatísticas Rápidas */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mb-2">
                  <FaBookOpen className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conteúdos</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-2">
                  <FaUsers className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Participação</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-2">
                  <FaTrophy className="text-yellow-600 dark:text-yellow-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Desempenho</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cabeçalho do Conteúdo */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                  <FaChartBar className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Visão Geral
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                    Controle suas atividades e acompanhe o progresso
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Relatórios */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lista de Tarefas */}
              <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-800 rounded-2xl">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                      <FaClipboardList className="text-white text-2xl" />
                      <h3 className="text-xl font-bold text-white">Lista de Tarefas</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <TodoList />
                  </div>
                </CardContent>
              </Card>

              {/* Metas */}
              <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 bg-white dark:bg-gray-800 rounded-2xl">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                      <FaBullseye className="text-white text-2xl" />
                      <h3 className="text-xl font-bold text-white">Metas Definidas</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <ListaMetas
                      dados={{
                        quizzes: totalQuizzesUsuario ?? 0,
                        planos: totalPlanosUsuario ?? 0,
                        enquetes: totalEnquetesUsuario ?? 0,
                        respostas_enquete: totalVotos ?? 0,
                        respostas_quiz: totalRespostasQuiz ?? 0,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Planos de Aula */}
              <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 bg-white dark:bg-gray-800 rounded-2xl">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                      <FaGraduationCap className="text-white text-2xl" />
                      <h3 className="text-xl font-bold text-white">Planos de Aula</h3>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <div className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                      {totalPlanosUsuario}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Planos criados
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
              <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 bg-white dark:bg-gray-800 rounded-2xl">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                      <FaChartPie className="text-white text-2xl" />
                      <h3 className="text-xl font-bold text-white">Eventos por Prioridade</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="w-full max-w-[300px] mx-auto">
                      <GraficoEventos dados={dadosEventos} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Desempenho por Disciplina */}
              <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 bg-white dark:bg-gray-800 rounded-2xl">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                      <FaPoll className="text-white text-2xl" />
                      <h3 className="text-xl font-bold text-white">Desempenho por Disciplina</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="w-full max-w-[600px] h-[400px] mx-auto">
                      <GraficoDesempenhoDisciplina dados={dadosDesempenho} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="bg-white dark:bg-gray-800 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="text-lg">Dashboard de Relatórios e Estatísticas</p>
            <p className="text-sm mt-2">Acompanhe seu progresso e performance acadêmica</p>
          </div>
        </div>
      </div>
    </div>
  );
}