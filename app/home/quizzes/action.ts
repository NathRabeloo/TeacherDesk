'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

export async function listarDisciplinas() {
  const { data, error } = await supabase.from("Disciplina").select("id, nome");
  if (error) throw error;
  return data;
}

export async function saveQuiz(title: string, questions: Question[], disciplinaId: string) {
  if (!title.trim() || questions.some(q => !q.text.trim() || q.options.length < 2)) {
    throw new Error("Preencha o título e todas as perguntas com pelo menos duas opções.");
  }

  const { data: quiz, error: quizError } = await supabase
    .from("Quiz")
    .insert({ titulo: title, disciplina_id: disciplinaId })
    .select()
    .single();
  if (quizError || !quiz) throw quizError;

  for (const question of questions) {
    const { data: questionData, error: questionError } = await supabase
      .from("Pergunta")
      .insert({ texto: question.text, quiz_id: quiz.id })
      .select()
      .single();
    if (questionError || !questionData) throw questionError;

    const optionsInsert = question.options.map((opt, idx) => ({
      texto: opt,
      correta: idx === question.correctAnswer,
      pergunta_id: questionData.id,
    }));
    const { error: optionError } = await supabase.from("OpcaoPergunta").insert(optionsInsert);
    if (optionError) throw optionError;
  }

  return { success: true };
}

export async function listarQuizzes() {
  const { data, error } = await supabase.from("Quiz").select("id, titulo");
  if (error) throw error;
  return data;
}
// Adicione essas funções ao seu arquivo action.ts

export async function buscarQuizParaEdicao(quizId: string) {
  try {
    // Buscar dados do quiz
    const { data: quiz, error: quizError } = await supabase
      .from("Quiz")
      .select("id, titulo, disciplina_id")
      .eq("id", quizId)
      .single();
    
    if (quizError || !quiz) throw quizError;

    // Buscar perguntas do quiz
    const { data: perguntas, error: perguntasError } = await supabase
      .from("Pergunta")
      .select("id, texto")
      .eq("quiz_id", quizId)
      .order("id");
    
    if (perguntasError) throw perguntasError;

    // Buscar opções para cada pergunta
    const questions = [];
    for (const pergunta of perguntas || []) {
      const { data: opcoes, error: opcoesError } = await supabase
        .from("OpcaoPergunta")
        .select("texto, correta")
        .eq("pergunta_id", pergunta.id)
        .order("id");
      
      if (opcoesError) throw opcoesError;

      const correctAnswer = opcoes?.findIndex(opcao => opcao.correta) || 0;
      const options = opcoes?.map(opcao => opcao.texto) || [];

      questions.push({
        text: pergunta.texto,
        options,
        correctAnswer
      });
    }

    return {
      id: quiz.id,
      titulo: quiz.titulo,
      disciplina_id: quiz.disciplina_id,
      questions
    };
  } catch (error) {
    console.error("Erro ao buscar quiz:", error);
    throw error;
  }
}

export async function atualizarQuiz(quizId: string, title: string, questions: Question[], disciplinaId: string) {
  if (!title.trim() || questions.some(q => !q.text.trim() || q.options.length < 2)) {
    throw new Error("Preencha o título e todas as perguntas com pelo menos duas opções.");
  }

  try {
    // Atualizar título e disciplina do quiz
    const { error: quizError } = await supabase
      .from("Quiz")
      .update({ titulo: title, disciplina_id: disciplinaId })
      .eq("id", quizId);
    
    if (quizError) throw quizError;

    // Deletar todas as opções antigas
    const { data: perguntasAntigas } = await supabase
      .from("Pergunta")
      .select("id")
      .eq("quiz_id", quizId);

    if (perguntasAntigas && perguntasAntigas.length > 0) {
      const perguntaIds = perguntasAntigas.map(p => p.id);
      
      // Deletar opções antigas
      await supabase
        .from("OpcaoPergunta")
        .delete()
        .in("pergunta_id", perguntaIds);
      
      // Deletar perguntas antigas
      await supabase
        .from("Pergunta")
        .delete()
        .eq("quiz_id", quizId);
    }

    // Inserir novas perguntas e opções
    for (const question of questions) {
      const { data: questionData, error: questionError } = await supabase
        .from("Pergunta")
        .insert({ texto: question.text, quiz_id: quizId })
        .select()
        .single();
      
      if (questionError || !questionData) throw questionError;

      const optionsInsert = question.options.map((opt, idx) => ({
        texto: opt,
        correta: idx === question.correctAnswer,
        pergunta_id: questionData.id,
      }));
      
      const { error: optionError } = await supabase
        .from("OpcaoPergunta")
        .insert(optionsInsert);
      
      if (optionError) throw optionError;
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar quiz:", error);
    throw error;
  }
}