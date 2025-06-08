"use client";

import { createClient } from "@supabase/supabase-js";
import { Quiz, Pergunta, Participante, QuizSession } from "./types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const QuizService = {
  async fetchQuiz(id: string): Promise<Quiz | null> {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from("Quiz")
        .select("id, titulo")
        .eq("id", id)
        .single();

      if (quizError || !quizData) {
        console.error("Quiz não encontrado:", quizError);
        return null;
      }

      const { data: perguntasData, error: perguntasError } = await supabase
        .from("Pergunta")
        .select("id, texto")
        .eq("quiz_id", id)
        .order("id");

      if (perguntasError) {
        console.error("Erro ao carregar perguntas:", perguntasError);
        return null;
      }

      const perguntasComOpcoes: Pergunta[] = await Promise.all(
        (perguntasData || []).map(async (pergunta) => {
          const { data: opcoesData, error: opcoesError } = await supabase
            .from("OpcaoPergunta")
            .select("id, texto, correta")
            .eq("pergunta_id", pergunta.id)
            .order("id");

          if (opcoesError) {
            console.error("Erro ao carregar opções:", opcoesError);
            return { ...pergunta, opcoes: [], respostaSelecionada: null };
          }

          return { 
            ...pergunta, 
            opcoes: opcoesData || [], 
            respostaSelecionada: null 
          };
        })
      );

      return { 
        id: quizData.id,
        titulo: quizData.titulo, 
        perguntas: perguntasComOpcoes 
      };
    } catch (error) {
      console.error("Erro ao carregar quiz:", error);
      return null;
    }
  },

  async criarParticipante(participante: Participante, quizId: string, sessionId?: string): Promise<string | null> {
    try {
      const participanteData = {
        nome: participante.nome.trim(),
        ra: participante.ra.trim(),
        quiz_id: quizId
      };

      // Se tiver sessionId, adiciona ao participante
      if (sessionId) {
        Object.assign(participanteData, { quiz_session_id: sessionId });
      }

      const { data: novoParticipante, error: participanteError } = await supabase
        .from("Participante")
        .insert(participanteData)
        .select()
        .single();

      if (participanteError || !novoParticipante) {
        console.error("Erro ao registrar participante:", participanteError);
        return null;
      }

      return novoParticipante.id;
    } catch (error) {
      console.error("Erro ao criar participante:", error);
      return null;
    }
  },

  async salvarResposta(
    participanteId: string,
    perguntaId: string,
    opcaoId: string | null,
    correta: boolean,
    iniciadaEm: string,
    respondidoEm: string
  ): Promise<void> {
    try {
      // Calcular o tempo de resposta em milissegundos
      const tempoInicio = new Date(iniciadaEm).getTime();
      const tempoFim = new Date(respondidoEm).getTime();
      const tempoRespostaMs = tempoFim - tempoInicio;

      console.log(`Tempo de resposta: ${tempoRespostaMs}ms`);

      const { error: respostaError } = await supabase.from("Resposta").upsert(
        {
          participante_id: participanteId,
          pergunta_id: perguntaId,
          opcao_id: opcaoId,
          correta: correta,
          iniciada_em: iniciadaEm,
          respondido_em: respondidoEm,
        },
        { onConflict: 'participante_id, pergunta_id' } // Conflito na combinação de participante_id e pergunta_id
      );

      if (respostaError) {
        console.error("Erro ao salvar resposta no Supabase:", respostaError);
        throw respostaError;
      }

      // Atualizar o tempo total do participante
      await this.atualizarTempoTotalParticipante(participanteId, tempoRespostaMs);
    } catch (error) {
      console.error("Erro geral na função salvarResposta:", error);
      throw error;
    }
  },

  async atualizarTempoTotalParticipante(participanteId: string, tempoAdicionalMs: number): Promise<void> {
    try {
      // Primeiro, obter o tempo total atual
      const { data: participanteData, error: getError } = await supabase
        .from("Participante")
        .select("tempo_total_ms")
        .eq("id", participanteId)
        .single();

      if (getError) {
        console.error("Erro ao obter participante:", getError);
        throw getError;
      }

      // Calcular o novo tempo total
      const tempoAtual = participanteData?.tempo_total_ms || 0;
      const novoTempoTotal = tempoAtual + tempoAdicionalMs;

      // Atualizar o participante com o novo tempo total
      const { error: updateError } = await supabase
        .from("Participante")
        .update({ tempo_total_ms: novoTempoTotal })
        .eq("id", participanteId);

      if (updateError) {
        console.error("Erro ao atualizar tempo total do participante:", updateError);
        throw updateError;
      }

      console.log(`Tempo total do participante atualizado: ${novoTempoTotal}ms`);
    } catch (error) {
      console.error("Erro ao atualizar tempo total do participante:", error);
      throw error;
    }
  },

  // Nova função para calcular e atualizar o score do participante
  async calcularEAtualizarScore(participanteId: string, totalAcertos: number): Promise<number> {
    try {
      // Obter o tempo total do participante
      const { data: participanteData, error: getError } = await supabase
        .from("Participante")
        .select("tempo_total_ms")
        .eq("id", participanteId)
        .single();

      if (getError) {
        console.error("Erro ao obter participante:", getError);
        throw getError;
      }

      const tempoTotalMs = participanteData?.tempo_total_ms || 0;
      const tempoTotalSec = tempoTotalMs / 1000; // Converter para segundos
      
      // Evitar divisão por zero
      const tempoBase = Math.max(tempoTotalSec, 1);
      
      // Fórmula do score: (acertos * 1000) / tempo_total_segundos
      // Multiplicamos por 1000 para ter números mais expressivos
      // Quanto mais acertos e menor o tempo, maior o score
      const score = Math.round((totalAcertos * 1000) / tempoBase);
      
      // Atualizar o score no banco de dados
      const { error: updateScoreError } = await supabase
        .from("Participante")
        .update({ score: score })
        .eq("id", participanteId);

      if (updateScoreError) {
        console.error("Erro ao atualizar score no banco de dados:", updateScoreError);
        throw updateScoreError;
      }

      console.log(`Score calculado e atualizado para o participante ${participanteId}: ${score}`);
      
      return score;
    } catch (error) {
      console.error("Erro ao calcular e atualizar score:", error);
      return 0;
    }
  },

  async enviarRespostas(quiz: Quiz, participanteId: string): Promise<{acertos: number, score: number}> {
    let correctCount = 0;

    try {
      // Apenas calcular o total de acertos, pois as respostas já foram salvas individualmente
      for (const pergunta of quiz.perguntas) {
        const opcaoSelecionada = pergunta.opcoes.find(o => o.id === pergunta.respostaSelecionada);
        if (opcaoSelecionada?.correta) {
          correctCount++;
        }
      }

      // Calcular e atualizar o score
      const score = await this.calcularEAtualizarScore(participanteId, correctCount);

      return { acertos: correctCount, score };
    } catch (error) {
      console.error("Erro ao enviar respostas:", error);
      throw error;
    }
  },

  // Novas funções para gerenciar sessões de quiz
  async fetchQuizSession(sessionId: string): Promise<QuizSession | null> {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from("QuizSession")
        .select("id, quiz_id, nome_sessao, created_at, user_id")
        .eq("id", sessionId)
        .single();

      if (sessionError || !sessionData) {
        console.error("Sessão de quiz não encontrada:", sessionError);
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error("Erro ao carregar sessão de quiz:", error);
      return null;
    }
  }
};


