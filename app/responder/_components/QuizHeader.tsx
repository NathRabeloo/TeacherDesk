"use client";

import React from "react";
import { BookOpen, Hash, Clock, Users, Tag } from "lucide-react";
import { Quiz } from "./types";

type QuizHeaderProps = {
  quiz: Quiz;
  participanteNome?: string;
  participanteRA?: string;
  respondidas?: number;
  showStats?: boolean;
  sessionInfo?: {
    id: string;
    nome: string;
  } | null;
  hideOnMobile?: boolean; // Nova prop para controlar visibilidade no mobile
};

export const QuizHeader: React.FC<QuizHeaderProps> = ({ 
  quiz, 
  participanteNome, 
  participanteRA,
  respondidas,
  showStats = true,
  sessionInfo,
  hideOnMobile = false
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 ${
      hideOnMobile ? 'hidden md:block' : ''
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {participanteNome && participanteRA ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 sm:p-3 rounded-xl shadow-lg flex-shrink-0">
                <BookOpen className="text-white text-xl sm:text-2xl" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {quiz.titulo}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">{participanteNome}</span>
                  {' | '}
                  <span className="hidden sm:inline">RA: </span>
                  <span className="font-semibold">{participanteRA}</span>
                </p>
                {sessionInfo && (
                  <div className="mt-1 inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                    <span className="truncate max-w-[150px] sm:max-w-none">{sessionInfo.nome}</span>
                  </div>
                )}
              </div>
            </div>
            {respondidas !== undefined && (
              <div className="text-center sm:text-right flex-shrink-0">
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {respondidas}/{quiz.perguntas.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Respondidas</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 sm:p-4 rounded-2xl shadow-lg inline-block mb-4 sm:mb-6">
              <BookOpen className="text-white text-3xl sm:text-4xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 px-4">
              {quiz.titulo}
            </h1>
            {sessionInfo && (
              <div className="mb-4 inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 mx-4">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-none">{sessionInfo.nome}</span>
              </div>
            )}
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 px-4">
              Preencha suas informações para começar o questionário
            </p>
          </div>
        )}
      </div>

      {showStats && !participanteNome && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Grid responsiva: 3 colunas no mobile, mantém 3 no desktop */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6 text-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-1.5 sm:p-3 rounded-full inline-block mb-2 sm:mb-3">
                <Hash className="text-blue-600 dark:text-blue-400 text-base sm:text-2xl" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {quiz.perguntas.length}
              </h3>
              <p className="text-xs sm:text-base text-gray-600 dark:text-gray-300">
                Pergunta{quiz.perguntas.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6 text-center">
              <div className="bg-green-100 dark:bg-green-900 p-1.5 sm:p-3 rounded-full inline-block mb-2 sm:mb-3">
                <Clock className="text-green-600 dark:text-green-400 text-base sm:text-2xl" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                ~{Math.ceil(quiz.perguntas.length * 1.5)}
              </h3>
              <p className="text-xs sm:text-base text-gray-600 dark:text-gray-300">Minutos</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6 text-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-1.5 sm:p-3 rounded-full inline-block mb-2 sm:mb-3">
                <Users className="text-purple-600 dark:text-purple-400 text-base sm:text-2xl" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Online</h3>
              <p className="text-xs sm:text-base text-gray-600 dark:text-gray-300">Modalidade</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};