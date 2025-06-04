'use client';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaChartBar, FaTrophy, FaGraduationCap } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  dados: { disciplina: string; taxa_acerto: number }[];
}

export default function GraficoDesempenhoDisciplina({ dados }: Props) {
  const labels = dados.map((d) => d.disciplina);
  const valores = dados.map((d) => d.taxa_acerto);

  // Calcular estatísticas
  const melhorDesempenho = Math.max(...valores);
  const mediaDesempenho = valores.reduce((acc, val) => acc + val, 0) / valores.length;
  const disciplinasAcima80 = valores.filter(val => val >= 80).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
            <FaChartBar className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Desempenho por Disciplina
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Análise das taxas de acerto em cada matéria
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full mb-2 mx-auto">
              <FaTrophy className="text-green-600 dark:text-green-400 text-sm" />
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {melhorDesempenho.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Melhor Nota</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full mb-2 mx-auto">
              <FaGraduationCap className="text-blue-600 dark:text-blue-400 text-sm" />
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {mediaDesempenho.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Média Geral</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full mb-2 mx-auto">
              <FaChartBar className="text-purple-600 dark:text-purple-400 text-sm" />
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {disciplinasAcima80}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Acima 80%</p>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="p-6">
        <div className="h-80">
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: 'Taxa de Acerto (%)',
                  data: valores,
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  borderColor: 'rgba(59, 130, 246, 1)',
                  borderWidth: 2,
                  borderRadius: 8,
                  borderSkipped: false,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  titleColor: 'white',
                  bodyColor: 'white',
                  borderColor: 'rgba(59, 130, 246, 1)',
                  borderWidth: 1,
                  cornerRadius: 8,
                  callbacks: {
                    label: function(context: any) {
                      return `Taxa de Acerto: ${context.parsed.y.toFixed(1)}%`;
                    }
                  }
                },
              },
              scales: {
                y: { 
                  beginAtZero: true, 
                  max: 100,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                  },
                  ticks: {
                    color: 'rgba(0, 0, 0, 0.7)',
                    callback: function(value: any) {
                      return value + '%';
                    }
                  }
                },
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: 'rgba(0, 0, 0, 0.7)',
                    maxRotation: 45,
                  }
                }
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}