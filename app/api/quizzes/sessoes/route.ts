import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("quizId");

    if (!quizId) {
      return NextResponse.json({ error: "ID do quiz não fornecido" }, { status: 400 });
    }

    // Buscar sessões do quiz
    const { data: sessoes, error } = await supabase
      .from("QuizSession")
      .select("id, nome_sessao, created_at")
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar sessões:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Para cada sessão, buscar o número de participantes
    const sessoesComParticipantes = await Promise.all(
      sessoes.map(async (sessao) => {
        const { count, error: countError } = await supabase
          .from("Participante")
          .select("id", { count: "exact", head: true })
          .eq("quiz_session_id", sessao.id);

        return {
          id: sessao.id,
          nome: sessao.nome_sessao,
          data: new Date(sessao.created_at).toLocaleDateString("pt-BR"),
          participantes: countError ? 0 : count || 0,
        };
      })
    );

    return NextResponse.json(sessoesComParticipantes);
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}