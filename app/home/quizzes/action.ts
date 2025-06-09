"use server";

import { createClient } from "@/lib/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

export async function listarDisciplinas() {
  const supabase = createClient();
  
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

// Novas funções para gerenciar sessões de quiz

export async function criarSessaoQuiz(quizId: string, nomeSessao: string) {
  try {
    const supabase = createClient();
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se o quiz pertence ao usuário
    const { data: quiz, error: quizError } = await supabase
      .from("Quiz")
      .select("id")
      .eq("id", quizId)
      .eq("user_id", user.id)
      .single();

    if (quizError || !quiz) {
      throw new Error("Quiz não encontrado ou você não tem permissão para criar uma sessão");
    }

    // Criar a sessão de quiz
    const { data: sessao, error: sessaoError } = await supabase
      .from("QuizSession")
      .insert({
        quiz_id: quizId,
        nome_sessao: nomeSessao,
        user_id: user.id
      })
      .select()
      .single();

    if (sessaoError || !sessao) {
      throw new Error("Erro ao criar sessão de quiz");
    }

    revalidatePath(`/admin/quizzes/${quizId}`);
    return sessao;
  } catch (error) {
    console.error("Erro ao criar sessão de quiz:", error);
    throw error;
  }
}

export async function listarSessoesQuiz(quizId: string) {
  try {
    const supabase = createClient();
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se o quiz pertence ao usuário
    const { data: quiz, error: quizError } = await supabase
      .from("Quiz")
      .select("id")
      .eq("id", quizId)
      .eq("user_id", user.id)
      .single();

    if (quizError || !quiz) {
      throw new Error("Quiz não encontrado ou você não tem permissão para visualizar suas sessões");
    }

    // Buscar as sessões do quiz
    const { data: sessoes, error: sessoesError } = await supabase
      .from("QuizSession")
      .select(`
        id,
        nome_sessao,
        created_at,
        Participante (count)
      `)
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: false });

    if (sessoesError) {
      throw new Error("Erro ao buscar sessões de quiz");
    }

    // Formatar os dados para exibição
    const sessoesFormatadas = sessoes?.map(sessao => ({
      id: sessao.id,
      nome: sessao.nome_sessao || `Sessão de ${new Date(sessao.created_at).toLocaleDateString()}`,
      data: new Date(sessao.created_at).toLocaleDateString(),
      participantes: sessao.Participante?.[0]?.count || 0
    })) || [];

    return sessoesFormatadas;
  } catch (error) {
    console.error("Erro ao listar sessões de quiz:", error);
    throw error;
  }
}

export async function obterLinkQuizSession(sessaoId: string) {
  try {
    const supabase = createClient();
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Buscar a sessão e verificar se pertence ao usuário
    const { data: sessao, error: sessaoError } = await supabase
      .from("QuizSession")
      .select(`
        id,
        quiz_id,
        user_id
      `)
      .eq("id", sessaoId)
      .single();

  if (sessaoError || !sessao || sessao.user_id !== user.id) {
  throw new Error("Sessão não encontrada ou você não tem permissão para acessá-la");
}


    // Retornar o link para a sessão
    return {
      quizId: sessao.quiz_id,
      sessionId: sessao.id,
      link: `/responder?id=${sessao.quiz_id}&session=${sessao.id}`
    };
  } catch (error) {
    console.error("Erro ao obter link da sessão:", error);
    throw error;
  }
}

export async function excluirSessaoQuiz(sessaoId: string) {
  try {
    const supabase = createClient();
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se a sessão pertence ao usuário
    const { data: sessao, error: sessaoError } = await supabase
      .from("QuizSession")
      .select("id, user_id, quiz_id") // Adicionado quiz_id aqui
      .eq("id", sessaoId)
      .single();

    if (sessaoError || !sessao || sessao.user_id !== user.id) {
      throw new Error("Sessão não encontrada ou você não tem permissão para excluí-la");
    }

    // Primeiro, excluir todos os participantes da sessão
    const { error: participantesError } = await supabase
      .from("Participante")
      .delete()
      .eq("quiz_session_id", sessaoId);

    if (participantesError) {
      console.error("Erro ao excluir participantes:", participantesError);
      // Não vamos parar aqui, pois pode não haver participantes
    }

    // Depois, excluir a sessão
    const { error: deleteError } = await supabase
      .from("QuizSession")
      .delete()
      .eq("id", sessaoId);

    if (deleteError) {
      throw new Error("Erro ao excluir sessão de quiz");
    }

    revalidatePath(`/admin/quizzes/${sessao.quiz_id}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir sessão de quiz:", error);
    throw error;
  }
}

// Função para obter resultados de um quiz (movida para action.ts)
export async function obterResultadosQuiz(quizId: string, sessionId?: string) {
  try {
    const supabase = createClient();

    // Consulta base para obter participantes
    let participantesQuery = supabase
      .from("Participante")
      .select(`
        id, 
        nome, 
        ra, 
        tempo_total_ms,
        score
      `)
      .eq("quiz_id", quizId);

    // Se tiver sessionId, filtrar por sessão
    if (sessionId) {
      participantesQuery = participantesQuery.eq("quiz_session_id", sessionId);
    }

    const { data: participantes, error: participantesError } = await participantesQuery;

    if (participantesError) {
      console.error("Erro ao buscar participantes:", participantesError);
      throw new Error("Erro ao buscar participantes");
    }

    // Obter todas as perguntas do quiz
    const { data: perguntas, error: perguntasError } = await supabase
      .from("Pergunta")
      .select("id, texto")
      .eq("quiz_id", quizId);

    if (perguntasError) {
      console.error("Erro ao buscar perguntas:", perguntasError);
      throw new Error("Erro ao buscar perguntas");
    }

    // Obter todas as respostas dos participantes
    let respostasQuery = supabase
      .from("Resposta")
      .select(`
        id,
        participante_id,
        pergunta_id,
        correta,
        iniciada_em,
        respondido_em
      `)
      .in(
        "participante_id",
        participantes.map((p) => p.id)
      );

    const { data: respostas, error: respostasError } = await respostasQuery;

    if (respostasError) {
      console.error("Erro ao buscar respostas:", respostasError);
      throw new Error("Erro ao buscar respostas");
    }

    // Calcular estatísticas para cada participante
    const ranking = participantes.map((participante) => {
      const respostasParticipante = respostas.filter(
        (r) => r.participante_id === participante.id
      );

      const totalRespostas = respostasParticipante.length;
      const totalAcertos = respostasParticipante.filter((r) => r.correta).length;
      const percentualAcerto =
        totalRespostas > 0 ? (totalAcertos / totalRespostas) * 100 : 0;

      const tempoTotal = participante.tempo_total_ms || 0;
      const tempoMedio = totalRespostas > 0 ? tempoTotal / totalRespostas : 0;
      
      // Usar o score do banco de dados ou calcular se não estiver disponível
      const score = participante.score; // Usar o score do banco de dados

      return {
        id: participante.id,
        nome: participante.nome,
        ra: participante.ra,
        totalRespostas,
        totalAcertos,
        percentualAcerto,
        tempoTotal,
        tempoMedio,
        score // Incluindo o score no ranking
      };
    });

    // Ordenar ranking por score (decrescente)
    ranking.sort((a, b) => b.score - a.score);

    // Calcular estatísticas para cada pergunta
    const perguntasStats = perguntas.map((pergunta) => {
      const respostasPergunta = respostas.filter(
        (r) => r.pergunta_id === pergunta.id
      );

      const totalRespostas = respostasPergunta.length;
      const totalAcertos = respostasPergunta.filter((r) => r.correta).length;
      const percentualAcerto =
        totalRespostas > 0 ? (totalAcertos / totalRespostas) * 100 : 0;

      return {
        id: pergunta.id,
        texto: pergunta.texto,
        totalRespostas,
        totalAcertos,
        percentualAcerto,
      };
    });

    // Calcular resumo geral
    const totalParticipantes = participantes.length;
    const totalPerguntas = perguntas.length;
    const totalRespostas = respostas.length;
    const totalAcertos = respostas.filter((r) => r.correta).length;
    const taxaAcertoGeral =
      totalRespostas > 0 ? (totalAcertos / totalRespostas) * 100 : 0;

    // Obter informações da sessão se houver
    let sessaoInfo = null;
    if (sessionId) {
      const { data: sessao, error: sessaoError } = await supabase
        .from("QuizSession")
        .select("id, nome_sessao, created_at")
        .eq("id", sessionId)
        .single();

      if (!sessaoError && sessao) {
        sessaoInfo = {
          id: sessao.id,
          nome: sessao.nome_sessao || `Sessão de ${new Date(sessao.created_at).toLocaleDateString()}`,
          data: sessao.created_at,
        };
      }
    }

    return {
      resumo: {
        total_participantes: totalParticipantes,
        total_perguntas: totalPerguntas,
        taxa_acerto_geral: taxaAcertoGeral,
      },
      ranking,
      perguntas: perguntasStats,
      sessao: sessaoInfo,
    };
  } catch (error) {
    console.error("Erro ao obter resultados:", error);
    throw error;
  }
}

// Função para atualizar o score de um participante
export async function atualizarScoreParticipante(participanteId: string, score: number) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("Participante")
      .update({ score })
      .eq("id", participanteId);

    if (error) {
      console.error("Erro ao atualizar score:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar score:", error);
    throw error;
  }
}

