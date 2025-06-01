import { createClient } from "@/lib/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TodoList } from "./ToDoList";
import { ListaMetas } from "./ListaMetas";

export default async function RelatoriosPage() {
  const supabase = createClient();

  // Buscar o total de quizzes
  const { count: totalQuizzes } = await supabase
    .from("Quiz") // Usando o nome correto da tabela
    .select("*", { count: "exact", head: true });

  // Buscar o total de planos de aula
  const { count: totalPlanos } = await supabase
    .from("PlanoAula") // Usando o nome correto da tabela
    .select("*", { count: "exact", head: true });

  // Buscar o total de enquetes
  const { count: totalEnquetes } = await supabase
    .from("Enquete") // Usando o nome correto da tabela
    .select("*", { count: "exact", head: true });

  // Buscar o total de votos nas enquetes
  const { count: totalVotos } = await supabase
    .from("respostas_enquete") // Usando o nome correto da tabela
    .select("*", { count: "exact", head: true });

  // Buscar o total de respostas nos quizzes
  const { count: totalRespostasQuiz } = await supabase
    .from("Resposta") // Usando o nome correto da tabela
    .select("*", { count: "exact", head: true });

  // Buscar o total de acertos no quiz
  const { count: totalAcertosQuiz } = await supabase
    .from("Resposta") // Usando o nome correto da tabela
    .select("*")
    .eq("acertou", true); // Supondo que você tenha um campo 'acertou' que armazena se a resposta foi correta

  // Calcular a taxa de acertos geral
  const taxaAcertosGeral = totalRespostasQuiz > 0 ? (totalAcertosQuiz / totalRespostasQuiz) * 100 : 0;

  // Calcular a participação nas enquetes
  const participacao =
    totalEnquetes && totalEnquetes > 0
      ? Math.min(Math.round((totalVotos / totalEnquetes) * 100), 100)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Card><TodoList /></Card>

      <Card>
        <ListaMetas
          dados={{
            quizzes: totalQuizzes ?? 0,
            planos: totalPlanos ?? 0,
            enquetes: totalEnquetes ?? 0,
            respostas_enquete: totalVotos ?? 0,
            respostas_quiz: totalRespostasQuiz ?? 0, // Passando o total de respostas do quiz
            taxa_acerto_quiz: taxaAcertosGeral.toFixed(2) + "%", // Passando a taxa de acerto geral
          }}
        />
      </Card>

      <Card>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Quizzes Criados</h2>
          <div className="text-5xl font-bold text-center text-blue-600">{totalQuizzes}</div>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Participação nas Enquetes</h2>
          <div className="text-center">
            <div className="text-4xl font-semibold">{participacao}%</div>
            <Progress value={participacao} className="mt-2" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Diários de Aula Criados</h2>
          <div className="text-5xl font-bold text-center text-green-600">{totalPlanos}</div>
        </div>
      </Card>

      {/* Adicionando Relatório de Desempenho nos Quizzes */}
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Taxa de Acerto Geral nos Quizzes</h2>
          <div className="text-5xl font-bold text-center text-green-600">
            {taxaAcertosGeral.toFixed(2)}%
          </div>
        </div>
      </Card>

      {/* Relatório de Respostas nos Quizzes */}
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Total de Respostas nos Quizzes</h2>
          <div className="text-5xl font-bold text-center text-blue-600">{totalRespostasQuiz}</div>
        </div>
      </Card>
    </div>
  );
}
