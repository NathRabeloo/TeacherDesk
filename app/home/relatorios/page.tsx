"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import dynamic from "next/dynamic";

const ClientOnlyChart = dynamic(() => import("../../_components/ClientOnlyChart"), {
  ssr: false,
});

export default function RelatoriosPage() {
  const tarefas = [
    { id: 1, titulo: "Criar quiz para aula 3", feito: true },
    { id: 2, titulo: "Corrigir atividades semanais", feito: false },
    { id: 3, titulo: "Agendar reunião com coordenação", feito: false },
  ];

  const tarefasStats = [
    { name: "Concluídas", valor: tarefas.filter((t) => t.feito).length },
    { name: "Pendentes", valor: tarefas.filter((t) => !t.feito).length },
  ];

  const quizzesCriados = 12;
  const participacao = 78; 
  const metas = [
    { titulo: "Criar 10 quizzes no mês", progresso: 100 },
    { titulo: "Concluir 15 tarefas pedagógicas", progresso: 60 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">To-do</h2>
          <ul className="space-y-2">
            {tarefas.map((tarefa) => (
              <li key={tarefa.id} className="flex items-center space-x-2">
                <Checkbox checked={tarefa.feito} />
                <span className={tarefa.feito ? "line-through text-gray-400" : ""}>{tarefa.titulo}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">Tarefas Realizadas</h2>
          <ClientOnlyChart data={tarefasStats} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">Participação nas Aulas</h2>
          <div className="text-center">
            <div className="text-4xl font-semibold">{participacao}%</div>
            <Progress value={participacao} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">Quizzes Criados</h2>
          <div className="text-5xl font-bold text-center text-blue-600">{quizzesCriados}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">Metas</h2>
          <ul className="space-y-4">
            {metas.map((meta, index) => (
              <li key={index}>
                <div className="text-sm font-medium mb-1">{meta.titulo}</div>
                <Progress value={meta.progresso} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}