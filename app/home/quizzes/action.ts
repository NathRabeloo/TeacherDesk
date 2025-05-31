'use server';

import { createClient } from '@/lib/utils/supabase/server';

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

export async function listarDisciplinas() {
  const supabase = createClient();
  
  // Verificar se o usuário está autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase.from("Disciplina").select("id, nome");
  if (error) throw error;
  return data;
}

export async function saveQuiz(title: string, questions: Question[], disciplinaId: string) {
  if (!title.trim() || questions.some(q => !q.text.trim() || q.options.length < 2)) {
    throw new Error("Preencha o título e todas as perguntas com pelo menos duas opções.");
  }

  const supabase = createClient();
  
  // Capturar o usuário autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Usuário não autenticado");
  }

  // Criar o quiz com o user_id
  const { data: quiz, error: quizError } = await supabase
    .from("Quiz")
    .insert({ 
      titulo: title, 
      disciplina_id: disciplinaId,
      user_id: user.id // Adicionar o ID do usuário
    })
    .select()
    .single();
  
  if (quizError || !quiz) throw quizError;

  // Criar as perguntas e opções
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
  const supabase = createClient();
  
  // Verificar se o usuário está autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Usuário não autenticado");
  }

  // Buscar apenas os quizzes do usuário autenticado
  const { data, error } = await supabase
    .from("Quiz")
    .select("id, titulo")
    .eq("user_id", user.id); // Filtrar por usuário
  
  if (error) throw error;
  return data;
}

export async function buscarQuizParaEdicao(quizId: string) {
  try {
    const supabase = createClient();
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Buscar o quiz verificando se pertence ao usuário
    const { data: quiz, error: quizError } = await supabase
      .from("Quiz")
      .select("id, titulo, disciplina_id")
      .eq("id", quizId)
      .eq("user_id", user.id) // Verificar se é do usuário
      .single();

    if (quizError || !quiz) {
      throw new Error("Quiz não encontrado ou você não tem permissão para editá-lo");
    }

    const { data: perguntas, error: perguntasError } = await supabase
      .from("Pergunta")
      .select("id, texto")
      .eq("quiz_id", quizId)
      .order("id");

    if (perguntasError) throw perguntasError;

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
    const supabase = createClient();
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Atualizar o quiz verificando se pertence ao usuário
    const { error: quizError } = await supabase
      .from("Quiz")
      .update({ titulo: title, disciplina_id: disciplinaId })
      .eq("id", quizId)
      .eq("user_id", user.id); // Verificar se é do usuário

    if (quizError) {
      throw new Error("Erro ao atualizar quiz ou você não tem permissão para editá-lo");
    }

    // Remover perguntas e opções antigas
    const { data: perguntasAntigas } = await supabase
      .from("Pergunta")
      .select("id")
      .eq("quiz_id", quizId);

    if (perguntasAntigas && perguntasAntigas.length > 0) {
      const perguntaIds = perguntasAntigas.map(p => p.id);

      await supabase
        .from("OpcaoPergunta")
        .delete()
        .in("pergunta_id", perguntaIds);

      await supabase
        .from("Pergunta")
        .delete()
        .eq("quiz_id", quizId);
    }

    // Criar novas perguntas e opções
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