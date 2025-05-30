"use client";

import React, { useState } from "react";
import Header from "../../_components/Header";
import QuizList from "./components/QuizList";
import QuizForm from "./components/QuizForm";
import QuizResultados from "./components/QuizResultados";
import { FaClipboardList, FaPlus, FaChartBar } from "react-icons/fa";

type ViewType = "list" | "create" | "edit" | "results";

const QuizDashboard = () => {
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
          <p>Quiz não encontrado</p>
        );
      default:
        return <p>Conteúdo não encontrado</p>;
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-50 dark:bg-dark-bg">
      <div className="flex-1 flex flex-col p-2 md:p-4 ml-0 md:ml-4">
        <div className="flex justify-between items-center my-4">
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        <div className="bg-white dark:bg-dark-primary rounded-lg p-4 flex-1 mb-4 shadow-md">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default QuizDashboard;
