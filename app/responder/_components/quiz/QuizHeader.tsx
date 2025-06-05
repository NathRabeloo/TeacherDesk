"use client";

import React from "react";
import { BookOpen, Hash, Clock, Users } from "lucide-react";
import { Quiz } from "../types";

type QuizHeaderProps = {
  quiz: Quiz;
  participanteNome?: string;
  participanteRA?: string;
  respondidas?: number;
  showStats?: boolean;
};

export const QuizHeader: React.FC<QuizHeaderProps> = ({ 
  quiz, 
  participanteNome, 
  participanteRA,
  respondidas,
  showStats = true
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {participanteNome && participanteRA ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <BookOpen className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.titulo}</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">{participanteNome}</span> | RA: <span className="font-semibold">{participanteRA}</span>
                </p>
              </div>
            </div>
            {respondidas !== undefined && (
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{respondidas}/{quiz.perguntas.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Respondidas</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg inline-block mb-6">
              <BookOpen className="text-white text-4xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {quiz.titulo}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Preencha suas informações para começar o questionário
            </p>
          </div>
        )}
      </div>

      {showStats && !participanteNome && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full inline-block mb-3">
                <Hash className="text-blue-600 dark:text-blue-400 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.perguntas.length}</h3>
              <p className="text-gray-600 dark:text-gray-300">Pergunta{quiz.perguntas.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full inline-block mb-3">
                <Clock className="text-green-600 dark:text-green-400 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">~{Math.ceil(quiz.perguntas.length * 1.5)}</h3>
              <p className="text-gray-600 dark:text-gray-300">Minutos</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full inline-block mb-3">
                <Users className="text-purple-600 dark:text-purple-400 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Online</h3>
              <p className="text-gray-600 dark:text-gray-300">Modalidade</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

