"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { Quiz } from "../types";
import { QuizQuestion } from "./QuizQuestion";

type QuizQuestionsProps = {
  quiz: Quiz;
  onSelectOption: (perguntaIndex: number, opcaoId: string) => void;
  onSubmit: () => void;
  loading: boolean;
  votado: boolean;
};

export const QuizQuestions: React.FC<QuizQuestionsProps> = ({ 
  quiz, 
  onSelectOption, 
  onSubmit, 
  loading, 
  votado 
}) => {
  const respondidas = quiz.perguntas.filter(p => p.respostaSelecionada).length;
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {quiz.perguntas.map((pergunta, pIndex) => (
          <QuizQuestion 
            key={pergunta.id}
            pergunta={pergunta}
            index={pIndex}
            onSelectOption={(opcaoId) => onSelectOption(pIndex, opcaoId)}
            disabled={votado}
          />
        ))}

        {/* Submit Button */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {respondidas === quiz.perguntas.length 
                ? "Todas as perguntas respondidas! Você pode finalizar o questionário."
                : `Responda todas as ${quiz.perguntas.length} perguntas para finalizar (${respondidas}/${quiz.perguntas.length})`
              }
            </p>
            <Button 
              onClick={onSubmit} 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-8 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 mx-auto"
              disabled={loading || votado || respondidas !== quiz.perguntas.length}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Trophy size={20} />
                  Finalizar Questionário
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

