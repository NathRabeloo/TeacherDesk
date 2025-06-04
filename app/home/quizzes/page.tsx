"use client";

import React, { useState } from "react";
import Header from "../../_components/Header";
import QuizList from "./components/QuizList";
import QuizForm from "./components/QuizForm";
import QuizResultados from "./components/QuizResultados";
import { FaClipboardList, FaPlus, FaChartBar, FaGraduationCap, FaUsers, FaTrophy } from "react-icons/fa";

type ViewType = "list" | "create" | "edit" | "results";

const PainelQuizzes = () => {
  const [activeView, setActiveView] = useState<ViewType>("list");
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);

  const handleViewChange = (view: ViewType, quizId?: string) => {
    setActiveView(view);
    setCurrentQuizId(quizId ?? null);
  };

  const handleCreateQuiz = () => handleViewChange("create");

  const handleEditQuiz = (quizId: string) => handleViewChange("edit", quizId);

  const handleViewResults = (quizId: string) => handleViewChange("results", quizId);

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
        return "Criar Novo Quiz";
      case "edit":
        return "Editar Quiz";
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
          <QuizResultados quizId={currentQuizId} onBack={handleCancel} />
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <FaGraduationCap className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {getPageTitle()}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  {getPageDescription()}
                </p>
              </div>
            </div>
            
            {/* Estatísticas Rápidas */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-2">
                  <FaClipboardList className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Questionários</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-2">
                  <FaUsers className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estudantes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-2">
                  <FaTrophy className="text-yellow-600 dark:text-yellow-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resultados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Navegação */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 py-4">
            <button
              onClick={() => handleViewChange("list")}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 ${
                activeView === "list"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md"
              }`}
            >
              <FaClipboardList className="text-xl" />
              <span className="hidden sm:inline">Lista de Questionários</span>
              <span className="sm:hidden">Lista</span>
            </button>
            
            <button
              onClick={handleCreateQuiz}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 ${
                activeView === "create"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md"
              }`}
            >
              <FaPlus className="text-xl" />
              <span className="hidden sm:inline">Criar Questionário</span>
              <span className="sm:hidden">Criar</span>
            </button>

            {activeView === "results" && (
              <button
                onClick={() => handleViewChange("results", currentQuizId || "")}
                className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-base bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105"
              >
                <FaChartBar className="text-xl" />
                <span className="hidden sm:inline">Resultados</span>
                <span className="sm:hidden">Dados</span>
              </button>
            )}

            {activeView === "edit" && (
              <button className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-base bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105">
                <FaClipboardList className="text-xl" />
                <span className="hidden sm:inline">Editando</span>
                <span className="sm:hidden">Editar</span>
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Seção de Conteúdo Principal */}
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

      {/* Rodapé */}
      <div className="bg-white dark:bg-gray-800 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="text-lg">Sistema de Gerenciamento de Quizzes</p>
            <p className="text-sm mt-2">Criado para facilitar o aprendizado interativo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelQuizzes;