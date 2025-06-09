import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const quizId = searchParams.get("quizId");
  const sessionId = searchParams.get("sessionId"); // Novo parâmetro para filtrar por sessão

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

    // 2️⃣ Buscar o ranking dos participantes com tempo total e score do banco
    let participantesQuery = supabase
      .from("Participante")
      .select(`
        id,
        nome,
        ra,
        tempo_total_ms,
        score,
        created_at
      `)
      .eq("quiz_id", quizId);
    
    // Se tiver sessionId, filtrar por sessão
    if (sessionId) {
      participantesQuery = participantesQuery.eq("quiz_session_id", sessionId);
    }
    
    const { data: participantes, error: participantesError } = await participantesQuery;

    if (participantesError) {
      console.error("Erro ao buscar participantes:", participantesError);
      throw participantesError;
    }

    // Buscar todas as respostas para o quiz, ordenadas para pegar a última
    const { data: todasRespostas, error: respostasError } = await supabase
      .from("Resposta")
      .select("participante_id, pergunta_id, correta, respondido_em")
      .in("participante_id", participantes?.map(p => p.id) || [])
      .order("respondido_em", { ascending: false }); // Ordenar para pegar a mais recente

    if (respostasError) {
      console.error("Erro ao buscar respostas:", respostasError);
      throw respostasError;
    }

    // Processar o ranking para contar acertos e incluir score
    const rankingDetalhado = (participantes || []).map(participante => {
      const respostasUnicas = new Map();
      todasRespostas?.filter(r => r.participante_id === participante.id)
                     .forEach(resposta => {
                       // A primeira resposta encontrada (mais recente devido à ordenação) é a que vale
                       if (!respostasUnicas.has(resposta.pergunta_id)) {
                         respostasUnicas.set(resposta.pergunta_id, resposta);
                       }
                     });
      
      const respostasFinais = Array.from(respostasUnicas.values());
      const totalRespostas = respostasFinais.length;
      const totalAcertos = respostasFinais.filter(r => r.correta).length;
      const percentualAcerto = totalRespostas > 0 ? (totalAcertos / totalRespostas) * 100 : 0;
      
      // Usar o tempo total e score do banco de dados
      const tempoTotal = participante.tempo_total_ms || 0;
      const score = participante.score || 0; // Incluir score do banco
      
      // Calcular tempo médio por pergunta com base nas respostas únicas

      return {
        id: participante.id,
        nome: participante.nome,
        ra: participante.ra,
        totalRespostas,
        totalAcertos,
        percentualAcerto: Math.round(percentualAcerto * 100) / 100,
        tempoTotal, // em ms, vem do banco
        score // Score do banco de dados
      };
    }).sort((a, b) => {
      // Ranking por score (desc) primeiro, depois por menor tempo total
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.tempoTotal - b.tempoTotal;
    });

    // 3️⃣ Buscar estatísticas por pergunta
    const { data: perguntas, error: perguntasError } = await supabase
      .from("Pergunta")
      .select(`
        id,
        texto
      `)
      .eq("quiz_id", quizId);

    if (perguntasError) {
      console.error("Erro ao buscar perguntas:", perguntasError);
      throw perguntasError;
    }

    const perguntasDetalhadas = (perguntas || []).map(pergunta => {
      // Filtrar respostas apenas para os participantes da sessão atual (se houver)
      const respostasRelevantes = todasRespostas?.filter(r => r.pergunta_id === pergunta.id);
      
      const respostasUnicasPorPergunta = new Map();
      respostasRelevantes?.forEach(resposta => {
        // A primeira resposta encontrada (mais recente devido à ordenação) é a que vale
        if (!respostasUnicasPorPergunta.has(resposta.participante_id)) {
          respostasUnicasPorPergunta.set(resposta.participante_id, resposta);
        }
      });
      
      const respostasFinaisDaPergunta = Array.from(respostasUnicasPorPergunta.values());
      const totalRespostas = respostasFinaisDaPergunta.length;
      const totalAcertos = respostasFinaisDaPergunta.filter(r => r.correta).length;
      const percentualAcerto = totalRespostas > 0 ? (totalAcertos / totalRespostas) * 100 : 0;
      
      return {
        id: pergunta.id,
        texto: pergunta.texto,
        totalRespostas,
        totalAcertos,
        percentualAcerto: Math.round(percentualAcerto * 100) / 100
      };
    });

    // Recalcular taxa de acerto geral com base nas respostas únicas
    let totalRespostasGeral = 0;
    let totalAcertosGeral = 0;

    participantes?.forEach(participante => {
      const respostasUnicasPorParticipante = new Map();
      todasRespostas?.filter(r => r.participante_id === participante.id)
                     .forEach(resposta => {
                       if (!respostasUnicasPorParticipante.has(resposta.pergunta_id)) {
                         respostasUnicasPorParticipante.set(resposta.pergunta_id, resposta);
                       }
                     });
      const respostasFinaisDoParticipante = Array.from(respostasUnicasPorParticipante.values());
      totalRespostasGeral += respostasFinaisDoParticipante.length;
      totalAcertosGeral += respostasFinaisDoParticipante.filter(r => r.correta).length;
    });

    // Ajustar os nomes das propriedades para coincidir com o que o frontend espera
    const resumoFormatado = {
      total_participantes: participantes?.length || 0, // Usar o número real de participantes filtrados
      total_perguntas: resumoFinal.total_perguntas,
      taxa_acerto_geral: totalRespostasGeral > 0 ? (totalAcertosGeral / totalRespostasGeral) * 100 : 0
    };

    // Buscar informações da sessão, se houver
    let sessaoInfo = null;
    if (sessionId) {
      const { data: sessao } = await supabase
        .from("QuizSession")
        .select("id, nome_sessao, created_at")
        .eq("id", sessionId)
        .single();
      
      if (sessao) {
        sessaoInfo = {
          id: sessao.id,
          nome: sessao.nome_sessao || `Sessão de ${new Date(sessao.created_at).toLocaleDateString()}`,
          data: new Date(sessao.created_at).toLocaleDateString()
        };
      }
    }

    return NextResponse.json({
      resumo: resumoFormatado,
      ranking: rankingDetalhado,
      perguntas: perguntasDetalhadas,
      sessao: sessaoInfo // Incluir informações da sessão na resposta
    });

  } catch (error) {
    console.error("Erro ao buscar resultados:", error);
    return NextResponse.json({ 
      error: "Erro ao buscar resultados.",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
}