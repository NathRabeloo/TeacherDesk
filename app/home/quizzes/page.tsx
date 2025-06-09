"use client";

import React, { useState } from "react";
import QuizList from "./components/QuizList";
import QuizForm from "./components/QuizForm";
import QuizResultados from "./components/QuizResultados";
import { FaClipboardList, FaPlus, FaChartBar, FaGraduationCap, FaUsers, FaTrophy } from "react-icons/fa";

type ViewType = "list" | "create" | "edit" | "results";

const PainelQuizzes = () => {
  const [activeView, setActiveView] = useState<ViewType>("list");
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);

  const handleViewChange = (view: ViewType, quizId?: string, sessionId?: string) => {
    setActiveView(view);
    setCurrentQuizId(quizId ?? null);
    setCurrentSessionId(sessionId);
  };

  const handleCreateQuiz = () => handleViewChange("create");

  const handleEditQuiz = (quizId: string) => handleViewChange("edit", quizId);

  const handleViewResults = (quizId: string, sessionId?: string) => handleViewChange("results", quizId, sessionId);

  const handleSaveQuiz = (quizData: any) => {
    console.log("Quiz salvo:", quizData);
    handleViewChange("list");
  };

  const handleCancel = () => handleViewChange("list");

  const getPageTitle = () => {
    switch (activeView) {
      case "list":
        return "Painel de Controle dos Quizzes";
      case "create":
        return "";
      case "edit":
        return "";
      case "results":
        return "Resultados do Quiz";
      default:
        return "Painel de Controle";
    }
  };

  const getPageDescription = () => {
    switch (activeView) {
      case "list":
        return "Gerencie todos os seus questionários em um só lugar";
      case "create":
        return "Crie um novo questionário interativo para seus alunos";
      case "edit":
        return "Edite e aprimore seu questionário existente";
      case "results":
        return "Visualize o desempenho e estatísticas detalhadas";
      default:
        return "Sistema de gerenciamento de questionários";
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case "list":
        return (
          <QuizList
            onCreateQuiz={handleCreateQuiz}
            onEditQuiz={handleEditQuiz}
            onViewResults={handleViewResults}
          />
        );
      case "create":
        return <QuizForm onCancel={handleCancel} onSave={handleSaveQuiz} />;
      case "edit":
        return (
          <QuizForm
            quizId={currentQuizId || undefined}
            onCancel={handleCancel}
            onSave={handleSaveQuiz}
          />
        );
      case "results":
        return currentQuizId ? (
          <QuizResultados 
            quizId={currentQuizId} 
            sessionId={currentSessionId}
            onBack={handleCancel} 
          />
        ) : (
          <div className="text-center py-12">
            <FaChartBar className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">Questionário não encontrado</p>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <FaGraduationCap className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">Conteúdo não encontrado</p>
          </div>
        );
    }
  };

  return (

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cabeçalho do Conteúdo */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${
                  activeView === "list" ? "bg-blue-500" :
                  activeView === "create" ? "bg-green-500" :
                  activeView === "edit" ? "bg-orange-500" : "bg-purple-500"
                }`}>
                  {activeView === "list" && <FaClipboardList className="text-white text-xl" />}
                  {activeView === "create" && <FaPlus className="text-white text-xl" />}
                  {activeView === "edit" && <FaClipboardList className="text-white text-xl" />}
                  {activeView === "results" && <FaChartBar className="text-white text-xl" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getPageTitle()}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                    {getPageDescription()}
                  </p>
                </div>
              </div>
              
              {activeView === "list" && (
                <button
                  onClick={handleCreateQuiz}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
                >
                  <FaPlus className="text-xl" />
                  Novo Questionário
                </button>
              )}
            </div>
          </div>

          {/* Área Principal do Conteúdo */}
          <div className="p-8">
            {renderMainContent()}
          </div>
        </div>
      </div>

  );
};

export default PainelQuizzes;

