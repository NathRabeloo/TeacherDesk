"use client";

import { useEffect, useState, useTransition } from "react";
import { FaPlus, FaTrash, FaArrowLeft, FaQuestionCircle, FaLightbulb, FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { saveQuiz, buscarQuizParaEdicao, atualizarQuiz } from "../action";
import { listarDisciplinas } from "../../../actions";

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

interface Disciplina {
  id: string;
  nome: string;
}

interface QuizFormProps {
  quizId?: string;
  onCancel?: () => void;
  onSave?: (quizData: any) => void;
}

export default function QuizForm({ quizId, onCancel, onSave }: QuizFormProps) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { text: "", options: ["", ""], correctAnswer: 0 },
  ]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [disciplinaId, setDisciplinaId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isEditing = !!quizId;

  useEffect(() => {
    async function fetchDisciplinas() {
      try {
        const data = await listarDisciplinas();
        setDisciplinas(data);
      } catch (error: any) {
        console.error("Erro ao carregar disciplinas:", error);
        if (error.message?.includes("não autenticado")) {
          alert("Sessão expirada. Faça login novamente.");
          router.push("/sign-in");
        } else {
          alert("Erro ao carregar disciplinas");
        }
      }
    }
    fetchDisciplinas();
  }, [router]);



  const loadQuizData = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const quizData = await buscarQuizParaEdicao(id);
        setTitle(quizData.titulo);
        setDisciplinaId(quizData.disciplina_id);
        setQuestions(quizData.questions);
      } catch (error: any) {
        console.error("Erro ao carregar quiz:", error);
        if (error.message?.includes("não autenticado")) {
          alert("Sessão expirada. Faça login novamente.");
          router.push("/sign-in");
        } else if (error.message?.includes("não tem permissão")) {
          alert("Você não tem permissão para editar este quiz.");
          if (onCancel) onCancel();
        } else {
          alert("Erro ao carregar dados do quiz");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router, onCancel]
  );

  useEffect(() => {
    if (isEditing && quizId) {
      loadQuizData(quizId);
    }
  }, [isEditing, quizId, loadQuizData]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", ""], correctAnswer: 0 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleAddOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push("");
    setQuestions(updated);
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.splice(optIndex, 1);
    // Se a resposta correta era a opção removida, mudar para a primeira opção
    if (updated[qIndex].correctAnswer >= optIndex && updated[qIndex].correctAnswer > 0) {
      updated[qIndex].correctAnswer = updated[qIndex].correctAnswer - 1;
    }
    setQuestions(updated);
  };

  const handleSave = () => {
    if (!disciplinaId) {
      alert("Selecione uma disciplina para o quiz.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing && quizId) {
          await atualizarQuiz(quizId, title, questions, disciplinaId);
          alert("Quiz atualizado com sucesso!");
        } else {
          await saveQuiz(title, questions, disciplinaId);
          alert("Quiz salvo com sucesso!");
        }
        
        // Resetar formulário apenas se estiver criando
        if (!isEditing) {
          setTitle("");
          setDisciplinaId(null);
          setQuestions([{ text: "", options: ["", ""], correctAnswer: 0 }]);
        }
        
        // Chamar callback se fornecido
        if (onSave) {
          onSave({ title, questions, disciplinaId });
        }
      } catch (error: any) {
        console.error(error);
        if (error.message?.includes("não autenticado")) {
          alert("Sessão expirada. Faça login novamente.");
          router.push("/sign-in");
        } else if (error.message?.includes("não tem permissão")) {
          alert("Você não tem permissão para realizar esta ação.");
        } else {
          alert("Erro ao salvar o quiz: " + (error.message || error));
        }
      }
    });
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-xl text-gray-700 dark:text-gray-300">Carregando dados do quiz...</p>
            </div>
          </div>
        </div>

    );
  }

  return (
    <div className="space-y-8">
      {/* Header da Seção */}
      <div className="flex items-center gap-4">
        {onCancel && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
          >
            <FaArrowLeft className="text-blue-600" />
          </Button>
        )}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? "Editar Quiz" : "Criar Novo Quiz"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
            {isEditing ? "Aprimore seu Quiz existente" : "Configure seu Quiz interativo"}
          </p>
        </div>
      </div>

      {/* Seção de Instruções */}
      {!isEditing && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 text-white">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <FaQuestionCircle className="text-2xl" />
              </div>
              <h3 className="text-2xl font-bold">Como criar um quiz perfeito</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-2 mt-1">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Defina o título</h4>
                    <p className="text-blue-100">Digite um título descritivo e atrativo</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-2 mt-1">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Escolha a disciplina</h4>
                    <p className="text-blue-100">Selecione a matéria relacionada</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-2 mt-1">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Crie as perguntas</h4>
                    <p className="text-blue-100">Adicione pelo menos 2 opções por pergunta</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FaLightbulb className="text-yellow-300 text-xl" />
                  <h4 className="font-semibold text-lg">Dicas importantes</h4>
                </div>
                <ul className="space-y-2 text-blue-100">
                  <li>• Seja claro e objetivo nas perguntas</li>
                  <li>• Marque sempre a resposta correta</li>
                  <li>• Use opções plausíveis para desafiar</li>
                  <li>• Teste seu quiz antes de publicar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário Principal */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="bg-blue-500 p-2 rounded-xl">
                  <FaQuestionCircle className="text-white" />
                </div>
                <span className="text-gray-900 dark:text-white">Informações Básicas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="title" className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Título do Quiz *
                </Label>
                <Input
                  id="title"
                  placeholder="Digite um título atrativo para seu quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 h-12 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <Label htmlFor="disciplina" className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Disciplina *
                </Label>
                <Select value={disciplinaId ?? ""} onValueChange={(val) => setDisciplinaId(val)}>
                  <SelectTrigger className="mt-2 h-12 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl">
                    <SelectValue placeholder="Selecione uma disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplinas.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Perguntas */}
          <div className="space-y-6">
            {questions.map((q, i) => (
              <Card key={i} className="border-0 shadow-xl bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 p-6">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-3 font-bold">
                        {i + 1}
                      </div>
                      <span className="text-xl text-gray-900 dark:text-white">Pergunta {i + 1}</span>
                    </div>
                    {questions.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveQuestion(i)}
                        title="Remover pergunta"
                        className="bg-red-500 hover:bg-red-600 rounded-xl shadow-lg"
                      >
                        <FaTrash size={14} />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label htmlFor={`question-${i}`} className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      Texto da pergunta *
                    </Label>
                    <Input
                      id={`question-${i}`}
                      placeholder="Digite sua pergunta aqui..."
                      value={q.text}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[i].text = e.target.value;
                        setQuestions(updated);
                      }}
                      className="mt-2 h-12 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        Opções de resposta *
                      </Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAddOption(i)}
                        className="flex items-center gap-2 rounded-xl border-2 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <FaPlus size={12} /> Adicionar opção
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Clique no círculo para marcar a resposta correta:
                    </p>
                    
                    <RadioGroup
                      value={String(q.correctAnswer)}
                      onValueChange={(val) => {
                        const updated = [...questions];
                        updated[i].correctAnswer = Number(val);
                        setQuestions(updated);
                      }}
                    >
                      {q.options.map((opt, j) => (
                        <div key={j} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                          <RadioGroupItem 
                            value={String(j)} 
                            id={`q${i}-opt${j}`}
                            className="text-green-600 w-5 h-5"
                          />
                          <Input
                            placeholder={`Opção ${j + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[i].options[j] = e.target.value;
                              setQuestions(updated);
                            }}
                            className="flex-1 border-0 bg-white dark:bg-gray-800 h-10"
                          />
                          {q.options.length > 2 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOption(i, j)}
                              title="Remover opção"
                              className="text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <FaTrash size={14} />
                            </Button>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                    
                    {q.correctAnswer !== undefined && q.options[q.correctAnswer] && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 p-4 rounded-xl border border-green-200 dark:border-green-700">
                        <div className="flex items-center space-x-3">
                          <FaCheckCircle className="text-green-600 text-xl" />
                          <div>
                            <p className="font-semibold text-green-700 dark:text-green-300">
                              Resposta correta selecionada
                            </p>
                            <p className="text-green-600 dark:text-green-400">
                              {q.options[q.correctAnswer] || "Opção não preenchida"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Botão Adicionar Pergunta */}
          <div className="text-center">
            <Button 
              onClick={handleAddQuestion} 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-3 mx-auto"
            >
              <FaPlus size={16} /> Adicionar Nova Pergunta
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resumo */}
          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 rounded-2xl overflow-hidden sticky top-4">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 p-6">
              <CardTitle className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-2 rounded-xl">
                  <FaLightbulb className="text-white" />
                </div>
                <span className="text-gray-900 dark:text-white">Resumo do Quiz</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Perguntas:</span>
                <span className="font-bold text-xl text-blue-600">{questions.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Opções totais:</span>
                <span className="font-bold text-xl text-green-600">
                  {questions.reduce((acc, q) => acc + q.options.length, 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Disciplina:</span>
                <span className="font-bold text-purple-600">
                  {disciplinaId ? disciplinas.find(d => d.id === disciplinaId)?.nome || "N/A" : "Não selecionada"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              {onCancel && (
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="w-full h-12 text-lg rounded-xl border-2 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              )}
              <Button 
                onClick={handleSave} 
                disabled={isPending}
                className="w-full h-12 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200"
              >
                {isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <>
                    {isEditing ? "Atualizar Quiz" : "Salvar Quiz"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Lembrete */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <h4 className="font-bold mb-3 text-purple-700 dark:text-purple-300 flex items-center space-x-2">
                <FaCheckCircle />
                <span>Checklist Final</span>
              </h4>
              <ul className="space-y-2 text-sm text-purple-600 dark:text-purple-400">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Título preenchido</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Disciplina selecionada</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Pelo menos 2 opções por pergunta</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Resposta correta marcada</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}