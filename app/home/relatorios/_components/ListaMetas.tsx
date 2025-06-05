"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaThLarge, FaPlus, FaTrash, FaTrophy, FaChartLine } from "react-icons/fa";

type MetaIndicador = "quizzes" | "planos" | "enquetes" | "respostas_enquete" | "respostas_quiz";

type Meta = {
  id: number;
  indicador: MetaIndicador;
  quantidade: number;
};

const indicadorLabels: Record<MetaIndicador, string> = {
  quizzes: "Quizzes Criados",
  planos: "Planos de Aula Registrados",
  enquetes: "Enquetes Criadas",
  respostas_enquete: "Respostas de Alunos em Enquetes",
  respostas_quiz: "Respostas de Alunos nos Quizzes",
};

const indicadorIcons: Record<MetaIndicador, JSX.Element> = {
  quizzes: <FaChartLine className="text-blue-500" />,
  planos: <FaThLarge className="text-green-500" />,
  enquetes: <FaTrophy className="text-purple-500" />,
  respostas_enquete: <FaPlus className="text-orange-500" />,
  respostas_quiz: <FaTrash className="text-red-500" />,
};

export function ListaMetas({
  dados,
}: {
  dados: Record<MetaIndicador, number>;
}) {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [indicador, setIndicador] = useState<MetaIndicador>("quizzes");
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    const salvas = localStorage.getItem("metas");
    if (salvas) {
      setMetas(JSON.parse(salvas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("metas", JSON.stringify(metas));
  }, [metas]);

  const adicionarMeta = () => {
    if (!quantidade || quantidade < 1) return;
    const nova: Meta = {
      id: Date.now(),
      indicador,
      quantidade,
    };
    setMetas((prev) => [...prev, nova]);
    setQuantidade(1);
  };

  const removerMeta = (id: number) => {
    setMetas((prev) => prev.filter((m) => m.id !== id));
  };

  const metasConcluidas = metas.filter(meta => {
    const atual = dados[meta.indicador] || 0;
    return atual >= meta.quantidade;
  }).length;

  const progressoGeral = metas.length > 0 ? (metasConcluidas / metas.length) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-600">
              <FaThLarge className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Gerenciamento de Metas
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Defina e acompanhe seus objetivos
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {metasConcluidas}/{metas.length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Concluídas</p>
          </div>
        </div>
      </div>

      {/* Progresso Geral */}
      {metas.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progresso Geral
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {progressoGeral.toFixed(1)}%
            </span>
          </div>
          <Progress value={progressoGeral} className="h-2" />
        </div>
      )}

      <div className="p-6">
        {/* Formulário de Adição */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 mb-6 border border-blue-200 dark:border-gray-600">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FaPlus className="mr-2 text-blue-600" />
            Nova Meta
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Select value={indicador} onValueChange={(value) => setIndicador(value as MetaIndicador)}>
              <SelectTrigger className="border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Selecione o indicador" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(indicadorLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center space-x-2">
                      {indicadorIcons[key as MetaIndicador]}
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              min={1}
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value))}
              placeholder="Quantidade desejada"
              className="border-gray-300 dark:border-gray-600"
            />
          </div>

          <Button
            onClick={adicionarMeta}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200"
          >
            <FaPlus className="mr-2" />
            Adicionar Meta
          </Button>
        </div>

        {/* Lista de Metas */}
        {metas.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaThLarge className="mx-auto text-4xl mb-4 opacity-50" />
            <p className="text-lg">Nenhuma meta definida ainda</p>
            <p className="text-sm">Adicione uma meta para começar a acompanhar seu progresso</p>
          </div>
        ) : (
          <div className="space-y-4">
            {metas.map((meta) => {
              const atual = dados[meta.indicador] || 0;
              const progresso = Math.min((atual / meta.quantidade) * 100, 100);
              const concluida = atual >= meta.quantidade;

              return (
                <div
                  key={meta.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    concluida
                      ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                      : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-750'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {indicadorIcons[meta.indicador]}
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {indicadorLabels[meta.indicador]}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Meta: {meta.quantidade} | Atual: {atual}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {concluida && (
                        <div className="p-1 rounded-full bg-green-500">
                          <FaTrophy className="text-white text-sm" />
                        </div>
                      )}
                      <Button
                        onClick={() => removerMeta(meta.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                      >
                        <FaTrash className="text-xs" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                      <span className={`font-bold ${concluida ? 'text-green-600' : 'text-blue-600'}`}>
                        {progresso.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={progresso} 
                      className={`h-3 ${concluida ? 'bg-green-100' : 'bg-gray-200'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}