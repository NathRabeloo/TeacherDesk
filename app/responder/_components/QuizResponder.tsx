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
import { CheckCircle, XCircle, User, Hash } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-6 text-center">
              <p>Carregando...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-6 text-center">
              <p>Quiz não encontrado.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!quizLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-6 text-center">
              <p>Carregando quiz...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-6 text-center">
              <p>Quiz não encontrado.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (etapa === "info") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                {quiz.titulo}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Preencha suas informações para começar
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nome" className="flex items-center gap-2 mb-2">
                  <User size={16} />
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
                  className={errors.nome ? "border-red-500" : ""}
                />
                {errors.nome && (
                  <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
                )}
              </div>

              <div>
                <Label htmlFor="ra" className="flex items-center gap-2 mb-2">
                  <Hash size={16} />
                  RA (Registro Acadêmico)
                </Label>
                <Input
                  id="ra"
                  placeholder="Digite seu RA (13 dígitos)"
                  value={participante.ra}
                  onChange={(e) => handleRAChange(e.target.value)}
                  className={errors.ra ? "border-red-500" : ""}
                  maxLength={13}
                  inputMode="numeric"
                />
                {errors.ra && (
                  <p className="text-red-500 text-sm mt-1">{errors.ra}</p>
                )}
                {participante.ra && !errors.ra && (
                  <p className="text-gray-500 text-sm mt-1">
                    {participante.ra.length}/13 dígitos
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Button 
                  onClick={iniciarQuiz} 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Iniciando..." : "Começar Quiz"}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500 pt-2">
                <p>{quiz.perguntas.length} pergunta{quiz.perguntas.length !== 1 ? 's' : ''}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (etapa === "quiz") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-xl">{quiz.titulo}</CardTitle>
              <p className="text-gray-600">
                Participante: <span className="font-semibold">{participante.nome}</span> | 
                RA: <span className="font-semibold">{participante.ra}</span>
              </p>
            </CardHeader>
          </Card>

          {quiz.perguntas.map((pergunta, pIndex) => (
            <Card key={pergunta.id} className="mb-6 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">
                  {pIndex + 1}. {pergunta.texto}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={pergunta.respostaSelecionada || ""}
                  onValueChange={(val) => selecionarResposta(pIndex, val)}
                  className="space-y-3"
                >
                  {pergunta.opcoes.map((opcao) => (
                    <div
                      key={opcao.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                    >
                      <RadioGroupItem
                        id={`${pergunta.id}-${opcao.id}`}
                        value={opcao.id}
                      />
                      <Label
                        htmlFor={`${pergunta.id}-${opcao.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        {opcao.texto}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <Button 
                onClick={enviarRespostas} 
                className="w-full"
                disabled={loading || votado}
              >
                {loading ? "Enviando..." : "Finalizar Quiz"}
              </Button>
            </CardContent>
          </Card>
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
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isCorrect && <CheckCircle className="text-green-600" size={16} />}
                          {isWrongSelected && <XCircle className="text-red-600" size={16} />}
                          <span className={isSelected ? "font-semibold" : ""}>
                            {opcao.texto}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}