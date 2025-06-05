"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, User, Hash, Play, Trophy, Clock, BookOpen, Users, Award } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Opcao = {
  id: string;
  texto: string;
  correta: boolean;
};

type Pergunta = {
  id: string;
  texto: string;
  opcoes: Opcao[];
  respostaSelecionada?: string | null;
};

type Quiz = {
  id: string;
  titulo: string;
  perguntas: Pergunta[];
};

type Participante = {
  nome: string;
  ra: string;
};

export default function ResponderQuizPage() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participante, setParticipante] = useState<Participante>({ nome: "", ra: "" });
  const [participanteId, setParticipanteId] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<"info" | "quiz" | "resultado">("info");
  const [votado, setVotado] = useState(false);
  const [acertos, setAcertos] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{nome?: string, ra?: string}>({});
  const [quizLoaded, setQuizLoaded] = useState(false);

  // Garantir que o componente está montado no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !id) return;

    async function fetchQuiz() {
      try {
        setLoading(true);
        
        const { data: quizData, error: quizError } = await supabase
          .from("Quiz")
          .select("id, titulo")
          .eq("id", id)
          .single();

        if (quizError || !quizData) {
          console.error("Quiz não encontrado:", quizError);
          alert("Quiz não encontrado.");
          return;
        }

        const { data: perguntasData, error: perguntasError } = await supabase
          .from("Pergunta")
          .select("id, texto")
          .eq("quiz_id", id)
          .order("id");

        if (perguntasError) {
          console.error("Erro ao carregar perguntas:", perguntasError);
          alert("Erro ao carregar perguntas.");
          return;
        }

        const perguntasComOpcoes: Pergunta[] = await Promise.all(
          (perguntasData || []).map(async (pergunta) => {
            const { data: opcoesData, error: opcoesError } = await supabase
              .from("OpcaoPergunta")
              .select("id, texto, correta")
              .eq("pergunta_id", pergunta.id)
              .order("id");

            if (opcoesError) {
              console.error("Erro ao carregar opções:", opcoesError);
              return { ...pergunta, opcoes: [], respostaSelecionada: null };
            }

            return { 
              ...pergunta, 
              opcoes: opcoesData || [], 
              respostaSelecionada: null 
            };
          })
        );

        setQuiz({ 
          id: quizData.id,
          titulo: quizData.titulo, 
          perguntas: perguntasComOpcoes 
        });
        setQuizLoaded(true);
      } catch (error) {
        console.error("Erro ao carregar quiz:", error);
        alert("Erro ao carregar o quiz.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [mounted, id]);

  const validarParticipante = () => {
    const newErrors: {nome?: string, ra?: string} = {};
    
    if (!participante.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }
    
    if (!participante.ra.trim()) {
      newErrors.ra = "RA é obrigatório";
    } else if (!/^\d{13}$/.test(participante.ra.trim())) {
      newErrors.ra = "RA deve conter exatamente 13 dígitos numéricos";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRAChange = (value: string) => {
    // Remove caracteres não numéricos
    const numbersOnly = value.replace(/\D/g, '');
    
    // Limita a 13 dígitos
    const limitedValue = numbersOnly.slice(0, 13);
    
    setParticipante(prev => ({ ...prev, ra: limitedValue }));
    
    // Remove erro se o RA estiver válido
    if (errors.ra && /^\d{13}$/.test(limitedValue)) {
      setErrors(prev => ({ ...prev, ra: undefined }));
    }
  };

  const iniciarQuiz = async () => {
    if (!validarParticipante() || !quiz) return;
    
    setLoading(true);
    try {
      // Criar participante no banco
      const { data: participanteData, error: participanteError } = await supabase
        .from("Participante")
        .insert({
          nome: participante.nome.trim(),
          ra: participante.ra.trim(),
          quiz_id: quiz.id
        })
        .select()
        .single();

      if (participanteError || !participanteData) {
        console.error("Erro ao registrar participante:", participanteError);
        throw new Error("Erro ao registrar participante");
      }

      setParticipanteId(participanteData.id);
      setEtapa("quiz");
    } catch (error) {
      console.error("Erro ao iniciar quiz:", error);
      alert("Erro ao iniciar o quiz. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

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

  const enviarRespostas = async () => {
    if (!quiz || !participanteId) return;

    if (quiz.perguntas.some((p) => !p.respostaSelecionada)) {
      alert("Por favor, responda todas as perguntas antes de enviar.");
      return;
    }

    setLoading(true);
    try {
      let correctCount = 0;

      // Salvar respostas no banco
      for (const pergunta of quiz.perguntas) {
        const opcaoSelecionada = pergunta.opcoes.find(o => o.id === pergunta.respostaSelecionada);
        const isCorreta = opcaoSelecionada?.correta || false;
        
        if (isCorreta) correctCount++;

        const { error: respostaError } = await supabase.from("Resposta").insert({
          participante_id: participanteId,
          pergunta_id: pergunta.id,
          opcao_id: pergunta.respostaSelecionada,
          correta: isCorreta
        });

        if (respostaError) {
          console.error("Erro ao salvar resposta:", respostaError);
          throw respostaError;
        }
      }

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600 dark:text-gray-300">Carregando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="p-12 text-center">
              <XCircle className="mx-auto text-6xl text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quiz não encontrado</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">O questionário solicitado não foi encontrado.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quizLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Carregando questionário...</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">Preparando seu quiz, aguarde um momento.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="p-12 text-center">
              <XCircle className="mx-auto text-6xl text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quiz não encontrado</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">O questionário solicitado não foi encontrado.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (etapa === "info") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg inline-block mb-6">
                <BookOpen className="text-white text-4xl" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {quiz.titulo}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Preencha suas informações para começar o questionário
              </p>
            </div>
          </div>
        </div>

        {/* Info Stats */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full inline-block mb-3">
                <Hash className="text-blue-600 dark:text-blue-400 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.perguntas.length}</h3>
              <p className="text-gray-600 dark:text-gray-300">Pergunta{quiz.perguntas.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full inline-block mb-3">
                <Clock className="text-green-600 dark:text-green-400 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">~{Math.ceil(quiz.perguntas.length * 1.5)}</h3>
              <p className="text-gray-600 dark:text-gray-300">Minutos</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full inline-block mb-3">
                <Users className="text-purple-600 dark:text-purple-400 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Online</h3>
              <p className="text-gray-600 dark:text-gray-300">Modalidade</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Informações do Participante</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Preencha seus dados para participar do questionário</p>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="nome" className="flex items-center gap-3 mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <User className="text-white" size={20} />
                    </div>
                    Nome Completo
                  </Label>
                  <Input
                    id="nome"
                    placeholder="Digite seu nome completo"
                    value={participante.nome}
                    onChange={(e) => {
                      setParticipante(prev => ({ ...prev, nome: e.target.value }));
                      if (errors.nome) setErrors(prev => ({ ...prev, nome: undefined }));
                    }}
                    className={`text-lg py-4 px-4 rounded-xl border-2 transition-all duration-200 ${
                      errors.nome 
                        ? "border-red-500 focus:border-red-600" 
                        : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
                    }`}
                  />
                  {errors.nome && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <XCircle size={16} />
                      {errors.nome}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="ra" className="flex items-center gap-3 mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <Hash className="text-white" size={20} />
                    </div>
                    RA (Registro Acadêmico)
                  </Label>
                  <Input
                    id="ra"
                    placeholder="Digite seu RA (13 dígitos)"
                    value={participante.ra}
                    onChange={(e) => handleRAChange(e.target.value)}
                    className={`text-lg py-4 px-4 rounded-xl border-2 transition-all duration-200 ${
                      errors.ra 
                        ? "border-red-500 focus:border-red-600" 
                        : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
                    }`}
                    maxLength={13}
                    inputMode="numeric"
                  />
                  {errors.ra && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <XCircle size={16} />
                      {errors.ra}
                    </p>
                  )}
                  {participante.ra && !errors.ra && (
                    <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={16} />
                      {participante.ra.length}/13 dígitos
                    </p>
                  )}
                </div>

                <div className="pt-6">
                  <Button 
                    onClick={iniciarQuiz} 
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-8 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Iniciando...
                      </>
                    ) : (
                      <>
                        <Play size={20} />
                        Começar Questionário
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (etapa === "quiz") {
    const respondidas = quiz.perguntas.filter(p => p.respostaSelecionada).length;
    const progresso = (respondidas / quiz.perguntas.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <BookOpen className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.titulo}</h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">{participante.nome}</span> | RA: <span className="font-semibold">{participante.ra}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{respondidas}/{quiz.perguntas.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Respondidas</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span>Progresso</span>
                <span>{Math.round(progresso)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progresso}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {quiz.perguntas.map((pergunta, pIndex) => (
              <div key={pergunta.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${
                      pergunta.respostaSelecionada ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      {pIndex + 1}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
                      {pergunta.texto}
                    </h3>
                    {pergunta.respostaSelecionada && (
                      <CheckCircle className="text-green-500" size={24} />
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <RadioGroup
                    value={pergunta.respostaSelecionada || ""}
                    onValueChange={(val) => selecionarResposta(pIndex, val)}
                    className="space-y-3"
                  >
                    {pergunta.opcoes.map((opcao, oIndex) => (
                      <div
                        key={opcao.id}
                        className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          pergunta.respostaSelecionada === opcao.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <RadioGroupItem
                          id={`${pergunta.id}-${opcao.id}`}
                          value={opcao.id}
                          className="w-5 h-5"
                        />
                        <div className={`flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full ${
                          pergunta.respostaSelecionada === opcao.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                        }`}>
                          {String.fromCharCode(65 + oIndex)}
                        </div>
                        <Label
                          htmlFor={`${pergunta.id}-${opcao.id}`}
                          className="flex-1 cursor-pointer text-lg text-gray-900 dark:text-white"
                        >
                          {opcao.texto}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  {respondidas === quiz.perguntas.length 
                    ? "Todas as perguntas respondidas! Você pode finalizar o questionário."
                    : `Responda todas as ${quiz.perguntas.length} perguntas para finalizar (${respondidas}/${quiz.perguntas.length})`
                  }
                </p>
                <Button 
                  onClick={enviarRespostas} 
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-8 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 mx-auto"
                  disabled={loading || votado || respondidas !== quiz.perguntas.length}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Trophy size={20} />
                      Finalizar Questionário
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


 if (etapa === "resultado") {
  const porcentagem = quiz.perguntas.length > 0 
    ? Math.round((acertos! / quiz.perguntas.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Resultado principal */}
        <Card className="shadow-lg mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">
              Quiz Finalizado!
            </CardTitle>
            <p className="text-gray-600">
              {participante.nome} | RA: {participante.ra}
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-blue-600">
              {acertos} / {quiz.perguntas.length}
            </div>
            <div className="text-xl text-gray-700">
              {porcentagem}% de acertos
            </div>
            <div className={`text-lg font-semibold ${
              porcentagem >= 70 ? "text-green-600" : 
              porcentagem >= 50 ? "text-yellow-600" : "text-red-600"
            }`}>
              {porcentagem >= 70 ? "Excelente!" : 
               porcentagem >= 50 ? "Bom trabalho!" : "Continue estudando!"}
            </div>
          </CardContent>
        </Card>

        {/* Revisão de perguntas */}
        {quiz.perguntas.map((pergunta, pIndex) => {
          const opcaoSelecionada = pergunta.opcoes.find(o => o.id === pergunta.respostaSelecionada);
          const opcaoCorreta = pergunta.opcoes.find(o => o.correta);
          const acertou = opcaoSelecionada?.correta || false;

          return (
            <Card key={pergunta.id} className="mb-4 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {acertou ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <XCircle className="text-red-600" size={20} />
                  )}
                  {pIndex + 1}. {pergunta.texto}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pergunta.opcoes.map((opcao) => {
                  const isSelected = pergunta.respostaSelecionada === opcao.id;
                  const isCorrect = opcao.correta;
                  const isWrongSelected = isSelected && !isCorrect;

                  return (
                    <div
                      key={opcao.id}
                      className={`p-3 rounded-lg border ${
                        isCorrect
                          ? "border-green-500 bg-green-50"
                          : isWrongSelected
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <span className={`font-semibold ${
                        isSelected ? "underline" : ""
                      }`}>
                        {opcao.texto}
                      </span>
                      {isCorrect && <CheckCircle className="inline ml-2 text-green-500" size={16} />}
                      {isWrongSelected && <XCircle className="inline ml-2 text-red-500" size={16} />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}

        {/* Mensagem final */}
        <Card className="shadow-lg mt-8 text-center">
          <CardContent>
            <h3 className="text-xl font-bold mb-2">
              {porcentagem >= 70 ? "🎉 Parabéns!" : 
               porcentagem >= 50 ? "👏 Bom trabalho!" : "📚 Continue estudando!"}
            </h3>
            <p className="text-gray-600 mb-4">
              {porcentagem >= 70 
                ? "Você demonstrou excelente conhecimento sobre o tema abordado no questionário!"
                : porcentagem >= 50 
                ? "Você teve um desempenho satisfatório. Continue se dedicando aos estudos!"
                : "Não desanime! Use este resultado como uma oportunidade de aprendizado e continue estudando."
              }
            </p>
            <p className="text-sm text-gray-500">
              Quiz finalizado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
  return null; // Caso nenhuma etapa corresponda, não renderiza nada
}