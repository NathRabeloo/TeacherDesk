"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { FaPlus, FaTrash } from "react-icons/fa";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Disciplina = {
  id: string;
  nome: string;
};

export default function QuizForm() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    {
      text: "",
      options: ["", ""],
      correctAnswer: 0,
    },
  ]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Buscar disciplinas do usuário ao carregar o componente
  useEffect(() => {
    async function fetchDisciplinas() {
      const { data, error } = await supabase
        .from("Disciplina")
        .select("id, nome")
        .order("nome", { ascending: true });
      if (error) {
        console.error("Erro ao buscar disciplinas:", error);
      } else {
        setDisciplinas(data || []);
        if (data && data.length > 0) {
          setSelectedDisciplina(data[0].id);
        }
      }
    }
    fetchDisciplinas();
  }, []);

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
    setQuestions(updated);
  };

  const handleSaveQuiz = async () => {
    if (!title.trim() || questions.some(q => !q.text.trim() || q.options.length < 2)) {
      alert("Preencha o título e todas as perguntas com pelo menos duas opções.");
      return;
    }
    if (!selectedDisciplina) {
      alert("Selecione uma disciplina.");
      return;
    }

    setIsSaving(true);

    try {
      const { data: quiz, error: quizError } = await supabase
        .from("Quiz")
        .insert({ titulo: title, disciplina_id: selectedDisciplina })
        .select()
        .single();

      if (quizError || !quiz) throw quizError;

      for (const question of questions) {
        const { data: questionData, error: questionError } = await supabase
          .from("Pergunta")
          .insert({
            texto: question.text,
            quiz_id: quiz.id,
          })
          .select()
          .single();

        if (questionError || !questionData) throw questionError;

        await Promise.all(
          question.options.map((opt, idx) =>
            supabase.from("OpcaoPergunta").insert({
              texto: opt,
              correta: idx === question.correctAnswer,
              pergunta_id: questionData.id,
            })
          )
        );
      }

      alert("Quiz salvo com sucesso!");
      setTitle("");
      setQuestions([{ text: "", options: ["", ""], correctAnswer: 0 }]);
      setSelectedDisciplina(disciplinas.length > 0 ? disciplinas[0].id : null);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar o quiz.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Criar Quiz</h2>

      <div>
        <Label htmlFor="disciplina">Disciplina</Label>
        <select
          id="disciplina"
          value={selectedDisciplina || ""}
          onChange={(e) => setSelectedDisciplina(e.target.value)}
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 mt-1"
        >
          {disciplinas.map((disciplina) => (
            <option key={disciplina.id} value={disciplina.id}>
              {disciplina.nome}
            </option>
          ))}
        </select>
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

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleAddOption(i)}
              >
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
        <Button
          variant="outline"
          onClick={handleAddQuestion}
          className="flex items-center gap-2"
        >
          <FaPlus size={14} /> Adicionar pergunta
        </Button>

        <Button
          onClick={handleSaveQuiz}
          disabled={isSaving}
        >
          {isSaving ? "Salvando..." : "Salvar Quiz"}
        </Button>
      </div>
    </div>
  );
}
