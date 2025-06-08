"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";
import { Pergunta } from "./types";

type QuizQuestionProps = {
  pergunta: Pergunta;
  index: number;
  onSelectOption: (opcaoId: string) => void;
  disabled?: boolean;
};

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
  pergunta, 
  index, 
  onSelectOption,
  disabled = false
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${
            pergunta.respostaSelecionada ? 'bg-green-500' : 'bg-gray-400'
          }`}>
            {index + 1}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
            {pergunta.texto}
          </h3>
          {pergunta.respostaSelecionada && (
            <CheckCircle className="text-green-500" size={24} />
          )}
        </div>
      </div>
      <div className="p-6">
        <RadioGroup
          value={pergunta.respostaSelecionada || ""}
          onValueChange={(val) => onSelectOption(val)} 
          className="space-y-3"
          disabled={disabled}
        >
          {pergunta.opcoes.map((opcao, oIndex) => (
            <div
              key={opcao.id}
              className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                pergunta.respostaSelecionada === opcao.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <RadioGroupItem
                id={`${pergunta.id}-${opcao.id}`}
                value={opcao.id}
                className="w-5 h-5"
              />
              <div className={`flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full ${
                pergunta.respostaSelecionada === opcao.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}>
                {String.fromCharCode(65 + oIndex)}
              </div>
              <Label
                htmlFor={`${pergunta.id}-${opcao.id}`}
                className="flex-1 cursor-pointer text-lg text-gray-900 dark:text-white"
              >
                {opcao.texto}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

