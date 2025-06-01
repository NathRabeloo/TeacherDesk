'use client';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

interface Props {
  dados: { disciplina: string; taxa_acerto: number }[];
}

export default function GraficoDesempenhoDisciplina({ dados }: Props) {
  const labels = dados.map((d) => d.disciplina);
  const valores = dados.map((d) => d.taxa_acerto);

  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: 'Taxa de Acerto (%)',
            data: valores,
            backgroundColor: '#3b82f6',
          },
        ],
      }}
      options={{
        scales: {
          y: { beginAtZero: true, max: 100 },
        },
      }}
    />
  );
}
