"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Question {
  id: string;
  text: string;
  type: "multiple" | "text";
  options?: string[];
  correctAnswer?: string | number;
}

interface QuizFormProps {
  quizId?: string;
  onCancel: () => void;
  onSave: (quizData: any) => void;
}

const QuizForm: React.FC<QuizFormProps> = ({ quizId, onCancel, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [disciplineId, setDisciplineId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [disciplines, setDisciplines] = useState<{ id: string; nome: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDisciplines();
    if (quizId) {
      loadQuizData(quizId);
    } else {
      setQuestions([
        {
          id: "1",
          text: "",
          type: "multiple",
          options: ["", ""],
          correctAnswer: 0,
        },
      ]);
    }
  }, [quizId]);

  const fetchDisciplines = async () => {
    const { data, error } = await supabase
      .from("Disciplina")
      .select("id, nome")
      .is("deleted_at", null);

    if (error) console.error("Erro ao carregar disciplinas", error);
    else setDisciplines(data || []);
  };

  const loadQuizData = async (id: string) => {
    setIsLoading(true);
    const { data: quiz, error: quizError } = await supabase
      .from("Quiz")
      .select("id, titulo, descricao, disciplina_id, Pergunta ( id, texto, tipo, OpcaoPergunta ( id, texto, correta ) )")
      .eq("id", id)
      .single();

    if (quizError || !quiz) {
      console.error("Erro ao carregar quiz", quizError);
      setIsLoading(false);
      return;
    }

    setTitle(quiz.titulo);
    setDescription(quiz.descricao);
    setDisciplineId(quiz.disciplina_id);
    setQuestions(
      (quiz.Pergunta || []).map((p: any) => ({
        id: p.id,
        text: p.texto,
        type: p.tipo === "unica_escolha" ? "multiple" : "text",
        options: p.OpcaoPergunta?.map((o: any) => o.texto) || [],
        correctAnswer: p.OpcaoPergunta?.findIndex((o: any) => o.correta) ?? 0,
      }))
    );
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!title || !disciplineId || questions.length === 0) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);

    try {
      let quiz_id = quizId;

      if (!quizId) {
        const { data, error } = await supabase.from("Quiz").insert({
          titulo: title,
          descricao: description,
          disciplina_id: disciplineId,
        }).select().single();

        if (error || !data) throw error;
        quiz_id = data.id;
      } else {
        await supabase.from("Quiz").update({
          titulo: title,
          descricao: description,
          disciplina_id: disciplineId,
        }).eq("id", quizId);

        await supabase.from("Pergunta").delete().eq("quiz_id", quizId);
      }

      for (const question of questions) {
        const { data: questionData, error: questionError } = await supabase
          .from("Pergunta")
          .insert({
            texto: question.text,
            tipo: question.type === "multiple" ? "unica_escolha" : "multipla_escolha",
            quiz_id,
          })
          .select()
          .single();

        if (questionError || !questionData) throw questionError;

        if (question.type === "multiple" && question.options) {
          await Promise.all(
            question.options.map((opt, index) =>
              supabase.from("OpcaoPergunta").insert({
                texto: opt,
                correta: question.correctAnswer === index,
                pergunta_id: questionData.id,
              })
            )
          );
        }
      }

      onSave({ id: quiz_id });
    } catch (e) {
      console.error("Erro ao salvar quiz", e);
      alert("Erro ao salvar quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">{quizId ? "Editar Quiz" : "Criar Quiz"}</h2>
      <input
        type="text"
        placeholder="Título"
        className="w-full mb-2 p-2 border"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Descrição"
        className="w-full mb-2 p-2 border"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <select
        className="w-full mb-4 p-2 border"
        value={disciplineId}
        onChange={(e) => setDisciplineId(e.target.value)}
      >
        <option value="">Selecione a disciplina</option>
        {disciplines.map((d) => (
          <option key={d.id} value={d.id}>{d.nome}</option>
        ))}
      </select>

      {questions.map((q, i) => (
        <div key={q.id} className="mb-4 p-2 border rounded">
          <input
            type="text"
            placeholder={`Pergunta ${i + 1}`}
            className="w-full mb-2 p-2 border"
            value={q.text}
            onChange={(e) => {
              const updated = [...questions];
              updated[i].text = e.target.value;
              setQuestions(updated);
            }}
          />
          <select
            value={q.type}
            onChange={(e) => {
              const updated = [...questions];
              updated[i].type = e.target.value as any;
              setQuestions(updated);
            }}
            className="w-full mb-2 p-2 border"
          >
            <option value="multiple">Múltipla Escolha</option>
            <option value="text">Texto</option>
          </select>

          {q.type === "multiple" && (
            <div>
              {q.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    checked={q.correctAnswer === idx}
                    onChange={() => {
                      const updated = [...questions];
                      updated[i].correctAnswer = idx;
                      setQuestions(updated);
                    }}
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...questions];
                      if (updated[i].options) updated[i].options![idx] = e.target.value;
                      setQuestions(updated);
                    }}
                    className="flex-1 p-1 border"
                  />
                  <button
                    onClick={() => {
                      const updated = [...questions];
                      if (updated[i].options) updated[i].options!.splice(idx, 1);
                      setQuestions(updated);
                    }}
                    className="text-red-500"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const updated = [...questions];
                  updated[i].options?.push("");
                  setQuestions(updated);
                }}
                className="text-blue-500 text-sm mt-2"
              >
                <FaPlus size={12} className="inline mr-1" /> Adicionar opção
              </button>
            </div>
          )}

          <button
            onClick={() => {
              const updated = [...questions];
              updated.splice(i, 1);
              setQuestions(updated);
            }}
            className="text-red-600 mt-2"
          >
            Remover pergunta
          </button>
        </div>
      ))}

      <button
        onClick={() => {
          setQuestions([...questions, {
            id: (questions.length + 1).toString(),
            text: "",
            type: "multiple",
            options: ["", ""],
            correctAnswer: 0,
          }]);
        }}
        className="text-blue-600 mb-4"
      >
        <FaPlus className="inline mr-1" /> Adicionar pergunta
      </button>

      <div className="flex justify-between">
        <button onClick={onCancel} className="text-gray-500">Cancelar</button>
        <button onClick={handleSave} className="text-blue-600">Salvar</button>
      </div>
    </div>
  );
};

export default QuizForm;
