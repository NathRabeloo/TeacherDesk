"use client";

import React, { useState } from "react";
import QuizList from "./components/QuizList";
import QuizResultados from "./components/QuizResultados";

// Componente principal que gerencia as diferentes views
export default function DashboardPrincipal() {
  const [currentView, setCurrentView] = useState<'list' | 'results' | 'create' | 'edit'>('list');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');

  const handleCreateQuiz = () => {
    setCurrentView('create');
    // Aqui você implementaria a lógica para mostrar o formulário de criação
  };

  const handleEditQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setCurrentView('edit');
    // Aqui você implementaria a lógica para mostrar o formulário de edição
  };

  const handleViewResults = (quizId: string) => {
    setSelectedQuizId(quizId);
    setCurrentView('results');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedQuizId('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {currentView === 'list' && (
        <QuizList
          onCreateQuiz={handleCreateQuiz}
          onEditQuiz={handleEditQuiz}
          onViewResults={handleViewResults}
        />
      )}

      {currentView === 'results' && selectedQuizId && (
        <QuizResultados
          quizId={selectedQuizId}
          onBack={handleBackToList}
        />
      )}

      {currentView === 'create' && (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Criar Novo Quiz</h1>
          <p className="text-gray-600">Formulário de criação de quiz aqui...</p>
          <button
            onClick={handleBackToList}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Voltar para lista
          </button>
        </div>
      )}

      {currentView === 'edit' && selectedQuizId && (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Editar Quiz</h1>
          <p className="text-gray-600">Quiz ID: {selectedQuizId}</p>
          <p className="text-gray-600">Formulário de edição de quiz aqui...</p>
          <button
            onClick={handleBackToList}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Voltar para lista
          </button>
        </div>
      )}
    </div>
  );
}