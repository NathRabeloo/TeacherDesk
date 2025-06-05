"use client";

import { createClient } from "@supabase/supabase-js";
import { Quiz, Pergunta, Participante } from "../types";

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

  async criarParticipante(participante: Participante, quizId: string): Promise<string | null> {
    try {
      const { data: participanteData, error: participanteError } = await supabase
        .from("Participante")
        .insert({
          nome: participante.nome.trim(),
          ra: participante.ra.trim(),
          quiz_id: quizId
        })
        .select()
        .single();

      if (participanteError || !participanteData) {
        console.error("Erro ao registrar participante:", participanteError);
        return null;
      }

      return participanteData.id;
    } catch (error) {
      console.error("Erro ao criar participante:", error);
      return null;
    }
  },

  async enviarRespostas(quiz: Quiz, participanteId: string): Promise<number> {
    let correctCount = 0;

    try {
      for (const pergunta of quiz.perguntas) {
        const opcaoSelecionada = pergunta.opcoes.find(o => o.id === pergunta.respostaSelecionada);
        const isCorreta = opcaoSelecionada?.correta || false;
        
        if (isCorreta) correctCount++;

        const { error: respostaError } = await supabase.from("Resposta").insert({
          participante_id: participanteId,
          pergunta_id: pergunta.id,
          opcao_id: pergunta.respostaSelecionada,
          correta: isCorreta
        });

        if (respostaError) {
          console.error("Erro ao salvar resposta:", respostaError);
          throw respostaError;
        }
      }

      return correctCount;
    } catch (error) {
      console.error("Erro ao enviar respostas:", error);
      throw error;
    }
  }
};

