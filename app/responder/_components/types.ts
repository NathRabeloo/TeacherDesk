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
  tempoRespostaMs?: number; // Tempo de resposta em milissegundos
};

export type Quiz = {
  id: string;
  titulo: string;
  perguntas: Pergunta[];
};

export type Participante = {
  nome: string;
  ra: string;
  score?: number; // Novo campo para armazenar a pontuação
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

// Novo tipo para o ranking com score
export type RankingItem = {
  id: string;
  nome: string;
  ra: string;
  totalRespostas: number;
  totalAcertos: number;
  percentualAcerto: number;
  tempoTotal: number; // em ms
  tempoMedio: number; // em ms - tempo médio por pergunta
  score: number; // Novo campo para pontuação
};

