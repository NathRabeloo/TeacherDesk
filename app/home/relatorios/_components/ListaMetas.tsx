"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

type MetaIndicador = "quizzes" | "planos" | "enquetes" | "respostas_enquete" |  "respostas_quiz";

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

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Escolha de metas do usuário</h2>

      <div className="flex flex-col gap-2">
        <select
          value={indicador}
          onChange={(e) => setIndicador(e.target.value as MetaIndicador)}
          className="border p-2 rounded"
        >
          {Object.entries(indicadorLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={1}
          value={quantidade}
          onChange={(e) => setQuantidade(parseInt(e.target.value))}
          className="border p-2 rounded"
          placeholder="Quantidade"
        />

        <button
          onClick={adicionarMeta}
          className=" bg-blue-800 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-200"
        >
          + Adicionar Meta
        </button>
      </div>

      <ul className="space-y-4">
        {metas.map((meta) => {
          const atual = dados[meta.indicador] || 0;
          const progresso = Math.min((atual / meta.quantidade) * 100, 100);

          return (
            <li key={meta.id}>
              <div className="flex justify-between items-center">
                <div className="w-full">
                  <div className="font-medium">
                    {indicadorLabels[meta.indicador]}: {meta.quantidade}
                  </div>
                  <Progress value={progresso} className="mt-1" />
                </div>
                <button
                  onClick={() => removerMeta(meta.id)}
                  className="text-red-800 text-sm ml-4"
                >
                  Remover
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
