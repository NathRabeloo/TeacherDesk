// app/relatorios/page.tsx
import { createClient } from "@/lib/utils/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function RelatoriosPage() {
  const supabase = createClient();

  // Total de quizzes
  const { count: totalQuizzes } = await supabase
    .from("Quiz")
    .select("*", { count: "exact", head: true });

  // Total de planos
  const { count: totalPlanos } = await supabase
    .from("PlanoAula")
    .select("*", { count: "exact", head: true });

  // Enquetes e votos
  const { count: totalEnquetes } = await supabase
    .from("enquetes")
    .select("*", { count: "exact", head: true });

  const { count: totalVotos } = await supabase
    .from("respostas_enquete")
    .select("*", { count: "exact", head: true });

  const participacao =
    totalEnquetes && totalEnquetes > 0
      ? Math.min(Math.round((totalVotos / totalEnquetes) * 100), 100)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">Quizzes Criados</h2>
          <div className="text-5xl font-bold text-center text-blue-600">{totalQuizzes}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">Participação nas Enquetes</h2>
          <div className="text-center">
            <div className="text-4xl font-semibold">{participacao}%</div>
            <Progress value={participacao} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">Diários de Aula Criados</h2>
          <div className="text-5xl font-bold text-center text-green-600">{totalPlanos}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">Metas</h2>
          <ul className="space-y-4">
            <li>
              <div className="text-sm font-medium mb-1">Criar 10 quizzes no mês</div>
              <Progress value={((totalQuizzes ?? 0) / 10) * 100} />
            </li>
            <li>
              <div className="text-sm font-medium mb-1">Registrar 5 planos de aula</div>
              <Progress value={((totalPlanos ?? 0) / 5) * 100} />
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
