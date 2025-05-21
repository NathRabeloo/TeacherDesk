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

export async function saveQuiz(title: string, questions: Question[], disciplinaId: string) {
  if (!title.trim() || questions.some(q => !q.text.trim() || q.options.length < 2)) {
    throw new Error("Preencha o título e todas as perguntas com pelo menos duas opções.");
  }

  const { data: quiz, error: quizError } = await supabase
    .from("Quiz")
    .insert({
      titulo: title,
      disciplina_id: disciplinaId, // <-- associar disciplina
    })
    .select()
    .single();

  if (quizError || !quiz) throw quizError;

  for (const question of questions) {
    const { data: questionData, error: questionError } = await supabase
      .from("Pergunta")
      .insert({
        texto: question.text,
        quiz_id: quiz.id,
      })
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
}


