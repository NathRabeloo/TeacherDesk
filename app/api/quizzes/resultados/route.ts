import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const quizId = searchParams.get("quizId");

  if (!quizId) {
    return NextResponse.json({ error: "ID do quiz é obrigatório." }, { status: 400 });
  }

  try {
    // 1️⃣ Buscar o resumo geral do quiz (usando a view)
    const { data: resumo, error: resumoError } = await supabase
      .from("dashboard_resumo")
      .select("*")
      .eq("quiz_id", quizId)
      .single();

    if (resumoError) {
      console.error("Erro ao buscar resumo:", resumoError);
      // Se não encontrar dados na view, criar um resumo básico
      const resumoBasico = {
        quiz_id: quizId,
        titulo: "Quiz",
        disciplina: "N/A",
        total_participantes: 0,
        total_perguntas: 0,
        total_respostas: 0,
        total_acertos: 0,
        percentual_acerto_geral: 0,
        media_acertos_por_participante: 0
      };
      
      // Tentar buscar dados básicos do quiz
      const { data: quizBasico } = await supabase
        .from("Quiz")
        .select(`
          id,
          titulo,
          Disciplina (nome)
        `)
        .eq("id", quizId)
        .single();
      
      if (quizBasico) {
        resumoBasico.titulo = quizBasico.titulo;
        resumoBasico.disciplina = quizBasico.Disciplina?.[0]?.nome || "N/A";
      }
    }

    const resumoFinal = resumo || {
      quiz_id: quizId,
      titulo: "Quiz",
      disciplina: "N/A",
      total_participantes: 0,
      total_perguntas: 0,
      total_respostas: 0,
      total_acertos: 0,
      percentual_acerto_geral: 0,
      media_acertos_por_participante: 0
    };

    // 2️⃣ Buscar o ranking dos participantes com tempo total do banco
    const { data: ranking, error: rankingError } = await supabase
      .from("Participante")
      .select(`
        id,
        nome,
        ra,
        tempo_total_ms,
        created_at,
        Resposta (
          id,
          correta,
          respondido_em
        )
      `)
      .eq("quiz_id", quizId);

    if (rankingError) {
      console.error("Erro ao buscar ranking:", rankingError);
      throw rankingError;
    }

    // Processar o ranking para contar acertos e usar tempo do banco
    const rankingDetalhado = (ranking || []).map(participante => {
      const respostas = participante.Resposta || [];
      const totalRespostas = respostas.length;
      const totalAcertos = respostas.filter(r => r.correta).length;
      const percentualAcerto = totalRespostas > 0 ? (totalAcertos / totalRespostas) * 100 : 0;
      
      // Usar o tempo total do banco de dados
      const tempoTotal = participante.tempo_total_ms || 0;
      
      // Calcular tempo médio por pergunta
      const tempoMedio = totalRespostas > 0 ? tempoTotal / totalRespostas : 0;

      return {
        id: participante.id,
        nome: participante.nome,
        ra: participante.ra,
        totalRespostas,
        totalAcertos,
        percentualAcerto: Math.round(percentualAcerto * 100) / 100,
        tempoTotal, // em ms, vem do banco
        tempoMedio: Math.round(tempoMedio) // tempo médio por pergunta em ms
      };
    }).sort((a, b) => {
      // Ranking por total de acertos (desc) e menor tempo total
      if (b.totalAcertos !== a.totalAcertos) {
        return b.totalAcertos - a.totalAcertos;
      }
      return a.tempoTotal - b.tempoTotal;
    });

    // 3️⃣ Buscar estatísticas por pergunta
    const { data: perguntas, error: perguntasError } = await supabase
      .from("Pergunta")
      .select(`
        id,
        texto,
        Resposta (
          id,
          correta
        )
      `)
      .eq("quiz_id", quizId);

    if (perguntasError) {
      console.error("Erro ao buscar perguntas:", perguntasError);
      throw perguntasError;
    }

    const perguntasDetalhadas = (perguntas || []).map(pergunta => {
      const respostas = pergunta.Resposta || [];
      const totalRespostas = respostas.length;
      const totalAcertos = respostas.filter(r => r.correta).length;
      const percentualAcerto = totalRespostas > 0 ? (totalAcertos / totalRespostas) * 100 : 0;
      
      return {
        id: pergunta.id,
        texto: pergunta.texto,
        totalRespostas,
        totalAcertos,
        percentualAcerto: Math.round(percentualAcerto * 100) / 100
      };
    });

    // Ajustar os nomes das propriedades para coincidir com o que o frontend espera
    const resumoFormatado = {
      total_participantes: resumoFinal.total_participantes,
      total_perguntas: resumoFinal.total_perguntas,
      taxa_acerto_geral: resumoFinal.percentual_acerto_geral || 0
    };

    return NextResponse.json({
      resumo: resumoFormatado,
      ranking: rankingDetalhado,
      perguntas: perguntasDetalhadas
    });

  } catch (error) {
    console.error("Erro ao buscar resultados:", error);
    return NextResponse.json({ 
      error: "Erro ao buscar resultados.",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
}