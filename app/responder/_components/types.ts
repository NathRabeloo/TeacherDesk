// _components/quiz/types.ts

export type Opcao = {
  id: string;
  texto: string;
  correta: boolean;
};

export type Pergunta = {
  id: string;
  texto: string;
  opcoes: Opcao[];
  respostaSelecionada?: string | null;
  tempoRespostaMs?: number; // Novo campo para o tempo de resposta
};

export type Quiz = {
  id: string;
  titulo: string;
  perguntas: Pergunta[];
};

export type Participante = {
  nome: string;
  ra: string;
};

export type ParticipanteErrors = {
  nome?: string;
  ra?: string;
};

export type QuizEtapa = "info" | "quiz" | "resultado";

export type QuizSession = {
  id: string;
  quiz_id: string;
  nome_sessao?: string | null;
  created_at: string;
  user_id?: string | null;
};


