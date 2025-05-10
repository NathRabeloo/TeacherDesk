"use client";

import React, { useState } from "react";
import Header from "../../components/Header";
import QuizList from "../../components/QuizList";
import QuizForm from "../../components/QuizForm";
import { FaClipboardList, FaPlus, FaChartBar } from "react-icons/fa";

const QuizPage = () => {
  const [activeView, setActiveView] = useState<"list" | "create" | "edit">("list");
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>(formatDate(new Date()));

  // Função para formatar a data
  function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('pt-BR', options);
  }

  // Função para alternar entre as diferentes visualizações
  const handleViewChange = (view: "list" | "create" | "edit", quizId?: string) => {
    setActiveView(view);
    if (quizId) {
      setCurrentQuizId(quizId);
    } else if (view === "create") {
      setCurrentQuizId(null);
    }
  };

  // Função para lidar com a criação de um novo quiz
  const handleCreateQuiz = () => {
    handleViewChange("create");
  };

  // Função para lidar com a edição de um quiz existente
  const handleEditQuiz = (quizId: string) => {
    handleViewChange("edit", quizId);
  };

  // Função para salvar o quiz (criar ou editar)
  const handleSaveQuiz = (quizData: any) => {
    console.log("Quiz salvo:", quizData);
    // Aqui você implementaria a chamada para sua API para salvar o quiz
    // Após salvar, voltar para a visualização da lista
    handleViewChange("list");
  };

  // Função para cancelar a criação/edição e voltar para a lista
  const handleCancel = () => {
    handleViewChange("list");
  };

  // Renderiza o conteúdo principal com base na visualização ativa
  const renderMainContent = () => {
    switch (activeView) {
      case "list":
        return (
          <QuizList
            onCreateQuiz={handleCreateQuiz}
            onEditQuiz={handleEditQuiz}
          />
        );
      case "create":
        return (
          <QuizForm
            onCancel={handleCancel}
            onSave={handleSaveQuiz}
          />
        );
      case "edit":
        return (
          <QuizForm
            quizId={currentQuizId || undefined}
            onCancel={handleCancel}
            onSave={handleSaveQuiz}
          />
        );
      default:
        return <div>Conteúdo não encontrado</div>;
    }
  };

  // Renderiza o cabeçalho apropriado com base na visualização ativa
  const renderHeader = () => {
    switch (activeView) {
      case "list":
        return (
          <Header
            date={currentDate}
            title="Biblioteca de Quizzes"
            buttonText="Criar Novo Quiz"
            buttonLink="#"
            desktopImageLeft="/assets/avatar_quiz.png"
            mobileImage="/assets/avatar_quiz_mobile.png"
            showOnlyLeftImage={true}
          />
        );
      case "create":
        return (
          <Header
            date={currentDate}
            title="Criar Novo Quiz"
            buttonText="Voltar para Lista"
            buttonLink="#"
            desktopImageLeft="/assets/avatar_quiz_create.png"
            mobileImage="/assets/avatar_quiz_create_mobile.png"
            showOnlyLeftImage={true}
          />
        );
      case "edit":
        return (
          <Header
            date={currentDate}
            title="Editar Quiz"
            buttonText="Voltar para Lista"
            buttonLink="#"
            desktopImageLeft="/assets/avatar_quiz_edit.png"
            mobileImage="/assets/avatar_quiz_edit_mobile.png"
            showOnlyLeftImage={true}
          />
        );
      default:
        return <Header date={currentDate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-50 dark:bg-dark-bg">
      {/* Sidebar */}

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col p-2 md:p-4 ml-0 md:ml-4">
        {/* Header com título dinâmico */}
        {renderHeader()}

        {/* Dark Mode Toggle e Ações */}
        <div className="flex justify-between items-center my-4">
          <div className="flex items-center gap-2">
            {/* Botões de navegação */}
            <button
              onClick={() => handleViewChange("list")}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                activeView === "list" 
                  ? "bg-blue-500 text-white" 
                  : "bg-blue-100 dark:bg-dark-card text-blue-800 dark:text-dark-text"
              }`}
            >
              <FaClipboardList />
              <span className="hidden md:inline">Lista</span>
            </button>
            <button
              onClick={handleCreateQuiz}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                activeView === "create" 
                  ? "bg-blue-500 text-white" 
                  : "bg-blue-100 dark:bg-dark-card text-blue-800 dark:text-dark-text"
              }`}
            >
              <FaPlus />
              <span className="hidden md:inline">Criar</span>
            </button>
            <button
              className="flex items-center gap-2 p-2 rounded-lg bg-blue-100 dark:bg-dark-card text-blue-800 dark:text-dark-text"
            >
              <FaChartBar />
              <span className="hidden md:inline">Relatórios</span>
            </button>
          </div>


        </div>

        {/* Conteúdo principal baseado na view ativa */}
        <div className="bg-white dark:bg-dark-primary rounded-lg p-4 flex-1 mb-4 shadow-md">
          {renderMainContent()}
        </div>

      </div>
    </div>
  );
};

export default QuizPage;