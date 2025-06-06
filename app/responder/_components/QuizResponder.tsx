"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Quiz, Participante, QuizEtapa, Pergunta } from "./types";
import { QuizService } from "./QuizService";
import { LoadingScreen } from "./LoadingScreen";
import { ErrorScreen } from "./ErrorScreen";
import { QuizHeader } from "./QuizHeader";
import { ProgressBar } from "./ProgressBar";
import { ParticipantInfoForm } from "./ParticipantInfoForm";
import { QuizQuestion } from "./QuizQuestion"; 
import { QuizResult } from "./QuizResult";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Trophy } from "lucide-react";

export default function QuizResponder() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const sessionId = searchParams.get("session"); // Novo parâmetro para sessão
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participante, setParticipante] = useState<Participante>({ nome: "", ra: "" });
  const [participanteId, setParticipanteId] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<QuizEtapa>("info");
  const [votado, setVotado] = useState(false);
  const [acertos, setAcertos] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizLoaded, setQuizLoaded] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const startTimeRef = useRef<number>(0);
  const [sessionInfo, setSessionInfo] = useState<{id: string, nome: string} | null>(null);

  // Garantir que o componente está montado no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Carregar o quiz e a sessão (se houver)
  useEffect(() => {
    if (!mounted || !id) return;

    async function fetchQuizAndSession() {
      try {
        setLoading(true);
        const quizData = await QuizService.fetchQuiz(id!); 
        
        if (quizData) {
          setQuiz(quizData);
          setQuizLoaded(true);
        }

        // Se tiver sessionId, buscar informações da sessão
        if (sessionId) {
          const sessionData = await QuizService.fetchQuizSession(sessionId);
          if (sessionData) {
            setSessionInfo({
              id: sessionData.id,
              nome: sessionData.nome_sessao || `Sessão de ${new Date(sessionData.created_at).toLocaleDateString()}`
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar quiz:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizAndSession();
  }, [mounted, id, sessionId]);

  // Iniciar o quiz
  const iniciarQuiz = async (dadosParticipante: Participante) => {
    if (!quiz) return;
    
    setParticipante(dadosParticipante);
    setLoading(true);
    
    try {
      // Passar o sessionId se existir
      const participanteId = await QuizService.criarParticipante(
        dadosParticipante, 
        quiz.id,
        sessionId || undefined
      );
      
      if (participanteId) {
        setParticipanteId(participanteId);
        setEtapa("quiz");
        startTimeRef.current = Date.now(); // Inicia o timer para a primeira pergunta
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

  // Selecionar resposta e salvar tempo
  const selecionarResposta = async (opcaoId: string) => {
    if (!quiz || votado || !participanteId) return;

    const tempoResposta = Date.now() - startTimeRef.current;
    const perguntaAtual = quiz.perguntas[currentQuestionIndex];

    const opcaoSelecionada = perguntaAtual.opcoes.find(o => o.id === opcaoId);
    const isCorreta = opcaoSelecionada?.correta || false;

    try {
      await QuizService.salvarResposta(
        participanteId,
        perguntaAtual.id,
        opcaoId,
        isCorreta,
        new Date(startTimeRef.current).toISOString(),
        new Date().toISOString()
      );

      setQuiz(prevQuiz => {
        if (!prevQuiz) return prevQuiz;
        
        const novasPerguntas = [...prevQuiz.perguntas];
        novasPerguntas[currentQuestionIndex] = {
          ...novasPerguntas[currentQuestionIndex],
          respostaSelecionada: opcaoId,
          tempoRespostaMs: tempoResposta
        };

        return { ...prevQuiz, perguntas: novasPerguntas };
      });
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
      alert("Erro ao salvar sua resposta. Tente novamente.");
    }
  };

  const goToNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.perguntas.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      startTimeRef.current = Date.now(); // Reinicia o timer para a próxima pergunta
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      startTimeRef.current = Date.now(); // Reinicia o timer para a pergunta anterior
    }
  };

  // Enviar respostas (finalizar quiz)
  const enviarRespostas = async () => {
    if (!quiz || !participanteId) return;

    // Verifica se todas as perguntas foram respondidas
    if (quiz.perguntas.some((p) => !p.respostaSelecionada)) {
      alert("Por favor, responda todas as perguntas antes de enviar.");
      return;
    }

    setLoading(true);
    try {
      // O cálculo de acertos é feito no frontend, pois as respostas já foram salvas individualmente
      let correctCount = 0;
      quiz.perguntas.forEach(pergunta => {
        const opcaoSelecionada = pergunta.opcoes.find(o => o.id === pergunta.respostaSelecionada);
        if (opcaoSelecionada?.correta) {
          correctCount++;
        }
      });
      
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
  if (!quizLoaded || (loading && etapa === "info")) {
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
        <QuizHeader 
          quiz={quiz} 
          sessionInfo={sessionInfo} // Passar informações da sessão
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ParticipantInfoForm onSubmit={iniciarQuiz} loading={loading} />
        </div>
      </div>
    );
  }

  if (etapa === "quiz") {
    const respondidas = quiz.perguntas.filter(p => p.respostaSelecionada).length;
    const currentQuestion = quiz.perguntas[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <QuizHeader 
          quiz={quiz} 
          participanteNome={participante.nome} 
          participanteRA={participante.ra} 
          respondidas={respondidas}
          showStats={false}
          sessionInfo={sessionInfo} // Passar informações da sessão
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProgressBar current={currentQuestionIndex + 1} total={quiz.perguntas.length} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <QuizQuestion 
            pergunta={currentQuestion}
            index={currentQuestionIndex}
            onSelectOption={selecionarResposta}
            disabled={votado} // Removido o disabled baseado em respostaSelecionada
          />
          <div className="flex justify-between mt-6">
            <Button 
              onClick={goToPreviousQuestion} 
              disabled={currentQuestionIndex === 0 || loading || votado}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-xl inline-flex items-center"
            >
              <ArrowLeft className="mr-2" size={20} />
              Anterior
            </Button>
            {currentQuestionIndex < quiz.perguntas.length - 1 ? (
              <Button 
                onClick={goToNextQuestion} 
                disabled={loading || votado || !currentQuestion.respostaSelecionada}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl inline-flex items-center"
              >
                Próxima
                <ArrowRight className="ml-2" size={20} />
              </Button>
            ) : (
              <Button 
                onClick={enviarRespostas} 
                disabled={loading || votado || !currentQuestion.respostaSelecionada}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl inline-flex items-center"
              >
                <Trophy className="mr-2" size={20} />
                Finalizar Quiz
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (etapa === "resultado" && acertos !== null) {
    return <QuizResult quiz={quiz} participante={participante} acertos={acertos} sessionInfo={sessionInfo} />;
  }

  return null; 
}

