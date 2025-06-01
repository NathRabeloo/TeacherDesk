"use client";

import { useEffect, useState, useTransition } from "react";
import { FaPlus, FaTrash, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

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

  const loadQuizData = async (id: string) => {
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
  };

  useEffect(() => {
    if (isEditing && quizId) {
      loadQuizData(quizId);
    }
  }, [isEditing, quizId]);

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
      <div className="p-4 max-w-2xl mx-auto">
        <p className="text-center">Carregando dados do quiz...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <FaArrowLeft />
          </Button>
        )}
        <h2 className="text-2xl font-bold">
          {isEditing ? "Editar Quiz" : "Criar Quiz"}
        </h2>
      </div>

      {/* Seção de Instruções */}
      {!isEditing && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <h3 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-300">
            📋 Como criar um quiz:
          </h3>
          <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
            <li>
              <b>Defina o título:</b> Digite um título descritivo para seu quiz no campo abaixo.
            </li>
            <li>
              <b>Selecione a disciplina:</b> Escolha a disciplina relacionada ao quiz no menu suspenso.
            </li>
            <li>
              <b>Crie as perguntas:</b> Para cada pergunta:
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>Digite o texto da pergunta</li>
                <li>Adicione pelo menos 2 opções de resposta</li>
                <li>Marque a opção correta clicando no botão de seleção</li>
                <li>Use "Adicionar opção" para mais alternativas</li>
              </ul>
            </li>
            <li>
              <b>Adicione mais perguntas:</b> Clique em "Adicionar pergunta" conforme necessário.
            </li>
            <li>
              <b>Salve o quiz:</b> Clique em "Salvar Quiz" para finalizar.
            </li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-300 dark:border-yellow-700">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 <b>Dica:</b> Certifique-se de que todas as perguntas tenham pelo menos 2 opções e uma resposta correta marcada antes de salvar.
            </p>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="title">Título do Quiz *</Label>
        <Input
          id="title"
          placeholder="Digite o título do quiz"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="disciplina">Disciplina *</Label>
        <Select value={disciplinaId ?? ""} onValueChange={(val) => setDisciplinaId(val)}>
          <SelectTrigger className="mt-1">
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

      {questions.map((q, i) => (
        <Card key={i} className="border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pergunta {i + 1}</span>
              {questions.length > 1 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveQuestion(i)}
                  title="Remover pergunta"
                >
                  <FaTrash size={14} />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`question-${i}`}>Texto da pergunta *</Label>
              <Input
                id={`question-${i}`}
                placeholder="Digite a pergunta"
                value={q.text}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[i].text = e.target.value;
                  setQuestions(updated);
                }}
                className="mt-1"
              />
            </div>

            <div className="space-y-2">
              <Label>Opções de resposta *</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Marque a opção correta clicando no botão ao lado:
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
                  <div key={j} className="flex items-center gap-2">
                    <RadioGroupItem 
                      value={String(j)} 
                      id={`q${i}-opt${j}`}
                      className="text-green-600"
                    />
                    <Input
                      id={`q${i}-opt${j}`}
                      placeholder={`Opção ${j + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[i].options[j] = e.target.value;
                        setQuestions(updated);
                      }}
                      className="flex-1"
                    />
                    {q.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(i, j)}
                        title="Remover opção"
                      >
                        <FaTrash size={14} className="text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </RadioGroup>

              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => handleAddOption(i)}
                className="flex items-center gap-2"
              >
                <FaPlus size={12} /> Adicionar opção
              </Button>
              
              {q.correctAnswer !== undefined && q.options[q.correctAnswer] && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ✓ <b>Resposta correta:</b> {q.options[q.correctAnswer] || "Opção não preenchida"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between items-center mt-6">
        <Button 
          variant="outline" 
          onClick={handleAddQuestion} 
          className="flex items-center gap-2"
        >
          <FaPlus size={14} /> Adicionar pergunta
        </Button>

        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? "Salvando..." : isEditing ? "Atualizar Quiz" : "Salvar Quiz"}
          </Button>
        </div>
      </div>

      {/* Rodapé com informações importantes */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
          📝 Lembrete:
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Campos marcados com * são obrigatórios</li>
          <li>• Cada pergunta deve ter pelo menos 2 opções</li>
          <li>• Sempre marque qual é a resposta correta</li>
          <li>• Você pode ter quantas perguntas e opções quiser</li>
        </ul>
      </div>
    </div>
  );
}