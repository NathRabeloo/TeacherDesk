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
import { ArrowLeft, ArrowRight, Trophy, Clock, Zap, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function QuizResponder() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const sessionId = searchParams.get("session"); // Parâmetro para sessão
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participante, setParticipante] = useState<Participante>({ nome: "", ra: "" });
  const [participanteId, setParticipanteId] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<QuizEtapa>("info");
  const [votado, setVotado] = useState(false);
  const [acertos, setAcertos] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0); // Novo estado para o score
  const [loading, setLoading] = useState(false);
  const [quizLoaded, setQuizLoaded] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const startTimeRef = useRef<number>(0);
  const [sessionInfo, setSessionInfo] = useState<{id: string, nome: string} | null>(null);
  
  // Novos estados para elementos interativos
  const [tempoDecorrido, setTempoDecorrido] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedbackCorreto, setFeedbackCorreto] = useState<boolean>(false);
  const [streakAcertos, setStreakAcertos] = useState<number>(0);
  const [showStreakBonus, setShowStreakBonus] = useState<boolean>(false);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streakTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Timer para atualizar o tempo decorrido
  useEffect(() => {
    if (etapa === "quiz" && startTimeRef.current > 0) {
      timerRef.current = setInterval(() => {
        setTempoDecorrido(Date.now() - startTimeRef.current);
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [etapa, startTimeRef.current]);

  // Iniciar o quiz com contagem regressiva
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
        
        // Iniciar contagem regressiva
        setShowCountdown(true);
        setCountdown(3);
        
        let count = 3;
        const countdownInterval = setInterval(() => {
          count -= 1;
          setCountdown(count);
          
          if (count <= 0) {
            clearInterval(countdownInterval);
            setShowCountdown(false);
            setEtapa("quiz");
            startTimeRef.current = Date.now(); // Inicia o timer para a primeira pergunta
          }
        }, 1000);
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

  // Função para disparar confetti quando acertar
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Selecionar resposta e salvar tempo
  const selecionarResposta = async (opcaoId: string) => {
    if (!quiz || votado || !participanteId) return;

    const tempoResposta = Date.now() - startTimeRef.current;
    const perguntaAtual = quiz.perguntas[currentQuestionIndex];

    const opcaoSelecionada = perguntaAtual.opcoes.find(o => o.id === opcaoId);
    const isCorreta = opcaoSelecionada?.correta || false;

    // Atualizar streak de acertos
    if (isCorreta) {
      setStreakAcertos(prev => prev + 1);
      if (streakAcertos + 1 >= 3) { // 3 acertos consecutivos
        setShowStreakBonus(true);
        triggerConfetti();
        
        // Esconder o bônus após 2 segundos
        if (streakTimerRef.current) {
          clearTimeout(streakTimerRef.current);
        }
        streakTimerRef.current = setTimeout(() => {
          setShowStreakBonus(false);
        }, 2000);
      }
    } else {
      setStreakAcertos(0);
    }

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

      // Mostrar feedback de resposta
      setFeedbackCorreto(isCorreta);
      setShowFeedback(true);
      
      // Esconder feedback após 1.5 segundos e avançar para próxima pergunta
      setTimeout(() => {
        setShowFeedback(false);
        
        // Se não for a última pergunta, avançar automaticamente
        if (currentQuestionIndex < (quiz?.perguntas.length || 0) - 1) {
          setTimeout(() => {
            goToNextQuestion();
          }, 500);
        }
      }, 1500);
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
      // Agora enviarRespostas retorna um objeto com acertos e score
      const resultado = await QuizService.enviarRespostas(quiz, participanteId);
      
      setAcertos(resultado.acertos);
      setScore(resultado.score);
      setVotado(true);
      setEtapa("resultado");
      
      // Disparar confetti para celebrar a conclusão
      if (resultado.acertos / quiz.perguntas.length >= 0.7) {
        setTimeout(() => {
          triggerConfetti();
        }, 500);
      }
    } catch (error) {
      console.error("Erro ao enviar respostas:", error);
      alert("Erro ao enviar respostas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Formatar tempo para exibição
  const formatarTempo = (ms: number) => {
    const segundos = Math.floor(ms / 1000);
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    
    return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
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

  // Exibir tela de contagem regressiva
  if (showCountdown) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Prepare-se!</h2>
          <div className="text-8xl font-bold text-blue-600 mb-8 animate-pulse">
            {countdown}
          </div>
          <p className="text-gray-600">O quiz começará em instantes...</p>
        </div>
      </div>
    );
  }

  // Exibir formulário de informações do participante
  if (etapa === "info") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          {quiz && (
            <>
              <QuizHeader 
                quiz={quiz} // Passando o objeto quiz completo
                sessionInfo={sessionInfo}
              />
              <ParticipantInfoForm 
                onSubmit={iniciarQuiz} 
                loading={loading} 
              />
            </>
          )}
        </div>
      </div>
    );
  }

  // Exibir resultado do quiz
  if (etapa === "resultado" && acertos !== null) {
    return (
      <QuizResult 
        quiz={quiz!} 
        participante={participante} 
        acertos={acertos} 
        score={score} // Passando o score para o componente de resultado
        sessionInfo={sessionInfo}
      />
    );
  }

  // Exibir quiz em andamento
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {quiz && (
          <>
            <QuizHeader 
              quiz={quiz} // Passando o objeto quiz completo
              sessionInfo={sessionInfo}
            />
            
            {/* Barra de progresso e informações */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-600">
                  Pergunta {currentQuestionIndex + 1} de {quiz.perguntas.length}
                </div>
                
                {/* Streak de acertos */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                    <Zap size={16} />
                    <span className="font-medium">{streakAcertos}</span>
                  </div>
                  
                  {/* Timer */}
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    <Clock size={16} />
                    <span className="font-medium">{formatarTempo(tempoDecorrido)}</span>
                  </div>
                </div>
              </div>
              
              <ProgressBar 
                value={((currentQuestionIndex + 1) / quiz.perguntas.length) * 100} // Ajustado para passar o valor correto
                className="h-2"
              />
            </div>
            
            {/* Animação de streak bonus */}
            <AnimatePresence>
              {showStreakBonus && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
                >
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
                    <Award size={24} />
                    <span className="text-xl font-bold">Sequência de {streakAcertos} acertos!</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Pergunta atual */}
            <div className="relative">
              {/* Feedback de resposta */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center z-10"
                  >
                    <div className={`text-white text-4xl font-bold p-8 rounded-2xl ${
                      feedbackCorreto 
                        ? "bg-green-500/90" 
                        : "bg-red-500/90"
                    }`}>
                      {feedbackCorreto ? "Correto!" : "Incorreto!"}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className={showFeedback ? "opacity-30" : ""}>
                <QuizQuestion
                  pergunta={quiz.perguntas[currentQuestionIndex]}
                  onSelectOption={selecionarResposta}
                  disabled={showFeedback}
                  index={currentQuestionIndex} // Adicionado o index
                />
              </div>
            </div>
            
            {/* Botões de navegação */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0 || showFeedback}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Anterior
              </Button>
              
              {currentQuestionIndex === quiz.perguntas.length - 1 ? (
                <Button
                  onClick={enviarRespostas}
                  disabled={!quiz.perguntas[currentQuestionIndex].respostaSelecionada || showFeedback}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center gap-2"
                >
                  <Trophy size={16} />
                  Finalizar Quiz
                </Button>
              ) : (
                <Button
                  onClick={goToNextQuestion}
                  disabled={!quiz.perguntas[currentQuestionIndex].respostaSelecionada || showFeedback}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center gap-2"
                >
                  Próxima
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

