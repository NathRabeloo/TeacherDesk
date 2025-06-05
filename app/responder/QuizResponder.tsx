"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Quiz, Participante, QuizEtapa } from "./_components/quiz/types";
import { QuizService } from "./_components/quiz/QuizService";
import { LoadingScreen } from "./_components/quiz/LoadingScreen";
import { ErrorScreen } from "./_components/quiz/ErrorScreen";
import { QuizHeader } from "./_components/quiz/QuizHeader";
import { ProgressBar } from "./_components/quiz/ProgressBar";
import { ParticipantInfoForm } from "./_components/quiz/ParticipantInfoForm";
import { QuizQuestions } from "./_components/quiz/QuizQuestions";
import { QuizResult } from "./_components/quiz/QuizResult";

export default function QuizResponder() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participante, setParticipante] = useState<Participante>({ nome: "", ra: "" });
  const [participanteId, setParticipanteId] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<QuizEtapa>("info");
  const [votado, setVotado] = useState(false);
  const [acertos, setAcertos] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizLoaded, setQuizLoaded] = useState(false);

  // Garantir que o componente está montado no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Carregar o quiz
  useEffect(() => {
    if (!mounted || !id) return; // 'id' é garantido como string aqui

    async function fetchQuiz() {
      try {
        setLoading(true);
        const quizData = await QuizService.fetchQuiz(id!); // Usar non-null assertion
        
        if (quizData) {
          setQuiz(quizData);
          setQuizLoaded(true);
        }
      } catch (error) {
        console.error("Erro ao carregar quiz:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [mounted, id]);

  // Iniciar o quiz
  const iniciarQuiz = async (dadosParticipante: Participante) => {
    if (!quiz) return;
    
    setParticipante(dadosParticipante);
    setLoading(true);
    
    try {
      const participanteId = await QuizService.criarParticipante(dadosParticipante, quiz.id);
      
      if (participanteId) {
        setParticipanteId(participanteId);
        setEtapa("quiz");
      } else {
        throw new Error("Erro ao registrar participante");
      }
    } catch (error) {
      console.error("Erro ao iniciar quiz:", error);
      alert("Erro ao iniciar o quiz. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Selecionar resposta
  const selecionarResposta = (perguntaIndex: number, opcaoId: string) => {
    if (!quiz || votado) return;

    setQuiz(prevQuiz => {
      if (!prevQuiz) return prevQuiz;
      
      const novasPerguntas = [...prevQuiz.perguntas];
      novasPerguntas[perguntaIndex] = {
        ...novasPerguntas[perguntaIndex],
        respostaSelecionada: opcaoId
      };

      return { ...prevQuiz, perguntas: novasPerguntas };
    });
  };

  // Enviar respostas
  const enviarRespostas = async () => {
    if (!quiz || !participanteId) return;

    if (quiz.perguntas.some((p) => !p.respostaSelecionada)) {
      alert("Por favor, responda todas as perguntas antes de enviar.");
      return;
    }

    setLoading(true);
    try {
      const correctCount = await QuizService.enviarRespostas(quiz, participanteId);
      
      setAcertos(correctCount);
      setVotado(true);
      setEtapa("resultado");
    } catch (error) {
      console.error("Erro ao enviar respostas:", error);
      alert("Erro ao enviar respostas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Aguardar montagem no cliente
  if (!mounted) {
    return <LoadingScreen />;
  }

  // Verificar se o ID do quiz foi fornecido
  if (!id) {
    return <ErrorScreen />;
  }

  // Exibir tela de carregamento enquanto o quiz está sendo carregado
  if (!quizLoaded || loading && etapa === "info") {
    return <LoadingScreen message="Carregando questionário..." subMessage="Preparando seu quiz, aguarde um momento." />;
  }

  // Verificar se o quiz foi encontrado
  if (!quiz) {
    return <ErrorScreen />;
  }

  // Renderizar a etapa atual
  if (etapa === "info") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <QuizHeader quiz={quiz} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ParticipantInfoForm onSubmit={iniciarQuiz} loading={loading} />
        </div>
      </div>
    );
  }

  if (etapa === "quiz") {
    const respondidas = quiz.perguntas.filter(p => p.respostaSelecionada).length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <QuizHeader 
          quiz={quiz} 
          participanteNome={participante.nome} 
          participanteRA={participante.ra} 
          respondidas={respondidas}
          showStats={false}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProgressBar current={respondidas} total={quiz.perguntas.length} />
        </div>
        <QuizQuestions 
          quiz={quiz} 
          onSelectOption={selecionarResposta} 
          onSubmit={enviarRespostas} 
          loading={loading} 
          votado={votado} 
        />
      </div>
    );
  }

  if (etapa === "resultado" && acertos !== null) {
    return <QuizResult quiz={quiz} participante={participante} acertos={acertos} />;
  }

  return null; // Caso nenhuma etapa corresponda, não renderiza nada
}


