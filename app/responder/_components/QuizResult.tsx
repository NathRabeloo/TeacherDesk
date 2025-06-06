"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Tag } from "lucide-react";
import { Quiz, Participante } from "./types";

type QuizResultProps = {
  quiz: Quiz;
  participante: Participante;
  acertos: number;
  sessionInfo?: {
    id: string;
    nome: string;
  } | null;
};

export const QuizResult: React.FC<QuizResultProps> = ({ quiz, participante, acertos, sessionInfo }) => {
  const porcentagem = quiz.perguntas.length > 0 
    ? Math.round((acertos / quiz.perguntas.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Resultado principal */}
        <Card className="shadow-lg mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">
              Quiz Finalizado!
            </CardTitle>
            <p className="text-gray-600">
              {participante.nome} | RA: {participante.ra}
            </p>
            {sessionInfo && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                <Tag className="w-3.5 h-3.5 mr-1" />
                {sessionInfo.nome}
              </div>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-blue-600">
              {acertos} / {quiz.perguntas.length}
            </div>
            <div className="text-xl text-gray-700">
              {porcentagem}% de acertos
            </div>
            <div className={`text-lg font-semibold ${
              porcentagem >= 70 ? "text-green-600" : 
              porcentagem >= 50 ? "text-yellow-600" : "text-red-600"
            }`}>
              {porcentagem >= 70 ? "Excelente!" : 
               porcentagem >= 50 ? "Bom trabalho!" : "Continue estudando!"}
            </div>
          </CardContent>
        </Card>

        {/* Revisão de perguntas */}
        {quiz.perguntas.map((pergunta, pIndex) => {
          const opcaoSelecionada = pergunta.opcoes.find(o => o.id === pergunta.respostaSelecionada);
          const opcaoCorreta = pergunta.opcoes.find(o => o.correta);
          const acertou = opcaoSelecionada?.correta || false;

          return (
            <Card key={pergunta.id} className="mb-4 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {acertou ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <XCircle className="text-red-600" size={20} />
                  )}
                  {pIndex + 1}. {pergunta.texto}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pergunta.opcoes.map((opcao) => {
                  const isSelected = pergunta.respostaSelecionada === opcao.id;
                  const isCorrect = opcao.correta;
                  const isWrongSelected = isSelected && !isCorrect;

                  return (
                    <div
                      key={opcao.id}
                      className={`p-3 rounded-lg border ${
                        isCorrect
                          ? "border-green-500 bg-green-50"
                          : isWrongSelected
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <span className={`font-semibold ${
                        isSelected ? "underline" : ""
                      }`}>
                        {opcao.texto}
                      </span>
                      {isCorrect && <CheckCircle className="inline ml-2 text-green-500" size={16} />}
                      {isWrongSelected && <XCircle className="inline ml-2 text-red-500" size={16} />}
                    </div>
                  );
                })}
                {pergunta.tempoRespostaMs && (
                  <div className="text-sm text-gray-500 mt-2">
                    Tempo de resposta: {(pergunta.tempoRespostaMs / 1000).toFixed(1)} segundos
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Mensagem final */}
        <Card className="shadow-lg mt-8 text-center">
          <CardContent>
            <h3 className="text-xl font-bold mb-2">
              {porcentagem >= 70 ? "🎉 Parabéns!" : 
               porcentagem >= 50 ? "👏 Bom trabalho!" : "📚 Continue estudando!"}
            </h3>
            <p className="text-gray-600 mb-4">
              {porcentagem >= 70 
                ? "Você demonstrou excelente conhecimento sobre o tema abordado no questionário!"
                : porcentagem >= 50 
                ? "Você teve um desempenho satisfatório. Continue se dedicando aos estudos!"
                : "Não desanime! Use este resultado como uma oportunidade de aprendizado e continue estudando."
              }
            </p>
            <p className="text-sm text-gray-500">
              Quiz finalizado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

