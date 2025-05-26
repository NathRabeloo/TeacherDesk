"use client";

import { useEffect, useState, useTransition } from "react";
import { FaPlus, FaTrash, FaArrowLeft } from "react-icons/fa";

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

  const isEditing = !!quizId;

  useEffect(() => {
    async function fetchDisciplinas() {
      try {
        const data = await listarDisciplinas();
        setDisciplinas(data);
      } catch (error) {
        alert("Erro ao carregar disciplinas");
      }
    }
    fetchDisciplinas();
  }, []);

  const loadQuizData = async (id: string) => {
    setIsLoading(true);
    try {
      const quizData = await buscarQuizParaEdicao(id);
      setTitle(quizData.titulo);
      setDisciplinaId(quizData.disciplina_id);
      setQuestions(quizData.questions);
    } catch (error) {
      console.error("Erro ao carregar quiz:", error);
      alert("Erro ao carregar dados do quiz");
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
        alert("Erro ao salvar o quiz: " + (error.message || error));
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

      <div>
        <Label htmlFor="title">Título do Quiz</Label>
        <Input
          id="title"
          placeholder="Digite o título do quiz"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="disciplina">Disciplina</Label>
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
            <CardTitle>Pergunta {i + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`question-${i}`}>Texto da pergunta</Label>
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
              <Label>Opções</Label>
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
                    <RadioGroupItem value={String(j)} id={`q${i}-opt${j}`} />
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

              <Button variant="secondary" size="sm" onClick={() => handleAddOption(i)}>
                <FaPlus className="mr-1" size={12} /> Adicionar opção
              </Button>
            </div>

            <div>
              {questions.length > 1 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveQuestion(i)}
                >
                  Remover pergunta
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between items-center mt-4">
        <Button variant="outline" onClick={handleAddQuestion} className="flex items-center gap-2">
          <FaPlus size={14} /> Adicionar pergunta
        </Button>

        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Salvando..." : isEditing ? "Atualizar Quiz" : "Salvar Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
}