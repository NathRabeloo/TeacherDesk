// types.ts - Versão atualizada com melhorias

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
  score?: number; // Campo para armazenar a pontuação
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

// Tipo melhorado para o ranking com score
export type RankingItem = {
  id: string;
  nome: string;
  ra: string;
  totalRespostas: number;
  totalAcertos: number;
  percentualAcerto: number;
  tempoTotal: number; // em ms
  tempoMedio: number; // em ms - tempo médio por pergunta
  score: number; // Campo para pontuação
  posicao?: number; // Posição no ranking
};

// Novo tipo para estatísticas detalhadas de pergunta
export type PerguntaEstatistica = {
  id: string;
  texto: string;
  totalRespostas: number;
  totalAcertos: number;
  percentualAcerto: number;
  dificuldade: 'Muito Fácil' | 'Fácil' | 'Média' | 'Difícil' | 'Muito Difícil';
  tempoMedioResposta?: number; // em ms
  distribuicaoRespostas?: {
    opcaoTexto: string;
    quantidade: number;
    percentual: number;
    correta: boolean;
  }[];
};

// Tipo para resumo geral melhorado
export type ResumoGeral = {
  total_participantes: number;
  total_perguntas: number;
  taxa_acerto_geral: number;
  tempo_medio_quiz: number;
  melhor_score: number;
  pior_score: number;
  score_medio: number;
};

// Tipo para dados completos dos resultados
export type ResultadosCompletos = {
  resumo: ResumoGeral;
  ranking: RankingItem[];
  perguntas: PerguntaEstatistica[];
  sessao?: {
    id: string;
    nome: string;
    data: string;
  } | null;
};

