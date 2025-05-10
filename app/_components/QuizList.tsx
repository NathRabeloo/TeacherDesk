"use client";

import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaQrcode } from "react-icons/fa6";
import { createClient } from "@supabase/supabase-js";
import SearchBar from "./SearchBar";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Quiz {
  id: string;
  title: string;
  discipline: string;
  createdAt: string;
}

interface QuizListProps {
  onCreateQuiz: () => void;
  onEditQuiz: (quizId: string) => void;
}

const QuizList: React.FC<QuizListProps> = ({ onCreateQuiz, onEditQuiz }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("");
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from("Quiz")
          .select(`
            id,
            titulo,
            created_at,
            Disciplina ( nome )
          `)
          .is("deleted_at", null)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        const quizzesFromDB: Quiz[] = (data || []).map((quiz: any) => ({
          id: quiz.id,
          title: quiz.titulo,
          discipline: quiz.Disciplina?.nome ?? "Sem disciplina",
          createdAt: quiz.created_at,
        }));

        setQuizzes(quizzesFromDB);
        setFilteredQuizzes(quizzesFromDB);

        const uniqueDisciplines = Array.from(
          new Set(quizzesFromDB.map((q) => q.discipline))
        );
        setDisciplines(uniqueDisciplines);

        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar quizzes:", error);
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  useEffect(() => {
    let filtered = [...quizzes];

    if (searchQuery) {
      filtered = filtered.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedDiscipline) {
      filtered = filtered.filter(
        (quiz) => quiz.discipline === selectedDiscipline
      );
    }

    setFilteredQuizzes(filtered);
  }, [searchQuery, selectedDiscipline, quizzes]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDisciplineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDiscipline(e.target.value);
  };

  const handleDelete = async (quizId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este quiz?")) {
      try {
        const { error } = await supabase
          .from("Quiz")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", quizId);

        if (error) throw error;

        const updatedQuizzes = quizzes.filter((quiz) => quiz.id !== quizId);
        setQuizzes(updatedQuizzes);
        setFilteredQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
      } catch (error) {
        console.error("Erro ao excluir quiz:", error);
      }
    }
  };

  const generateQRCode = (quizId: string) => {
    console.log(`Gerando QR Code para o quiz ${quizId}`);
    alert(`QR Code gerado para o quiz ID: ${quizId}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Meus quizzes</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Selecione os quizzes desejados para visualizar, editar ou gerar o QR Code
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          placeholder="Buscar quizzes..."
        />

        <div className="flex items-center gap-2">
          <label htmlFor="discipline" className="text-sm font-medium">
            Disciplina
          </label>
          <select
            id="discipline"
            className="p-2 rounded-lg bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border"
            value={selectedDiscipline}
            onChange={handleDisciplineChange}
          >
            <option value="">Todas</option>
            {disciplines.map((discipline, index) => (
              <option key={index} value={discipline}>
                {discipline}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Carregando quizzes...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-dark-card rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">Nenhum quiz encontrado.</p>
          <button
            onClick={onCreateQuiz}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Criar Primeiro Quiz
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-100 dark:bg-dark-hover">
                <tr>
                  <th className="py-3 px-4 text-left">Quizzes criados</th>
                  <th className="py-3 px-4 text-left">Disciplina</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map((quiz) => (
                  <tr
                    key={quiz.id}
                    className="border-t border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover"
                  >
                    <td className="py-3 px-4">{quiz.title}</td>
                    <td className="py-3 px-4">{quiz.discipline}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => generateQRCode(quiz.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded"
                        >
                          GERAR QR CODE
                        </button>
                        <button
                          onClick={() => onEditQuiz(quiz.id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(quiz.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizList;
