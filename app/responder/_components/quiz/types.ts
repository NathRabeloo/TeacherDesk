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

