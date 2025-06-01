'use client';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  dados: { prioridade: string; quantidade: number }[];
}

export default function GraficoEventos({ dados }: Props) {
  const labels = dados.map((e) => e.prioridade);
  const valores = dados.map((e) => e.quantidade);

  return (
    <Pie
      data={{
        labels,
        datasets: [
          {
            label: 'Eventos por Prioridade',
            data: valores,
            backgroundColor: ['#ef4444', '#facc15', '#4ade80'],
          },
        ],
      }}
    />
  );
}
