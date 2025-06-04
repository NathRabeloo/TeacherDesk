'use client';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaCalendarAlt, FaExclamationTriangle, FaClock, FaCheckCircle } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  dados: { prioridade: string; quantidade: number }[];
}

const getPrioridadeIcon = (prioridade: string) => {
  switch (prioridade.toLowerCase()) {
    case 'alta':
      return <FaExclamationTriangle className="text-red-500" />;
    case 'média':
    case 'media':
      return <FaClock className="text-yellow-500" />;
    case 'baixa':
      return <FaCheckCircle className="text-green-500" />;
    default:
      return <FaCalendarAlt className="text-gray-500" />;
  }
};

const getPrioridadeColor = (prioridade: string) => {
  switch (prioridade.toLowerCase()) {
    case 'alta':
      return 'rgba(239, 68, 68, 0.8)';
    case 'média':
    case 'media':
      return 'rgba(250, 204, 21, 0.8)';
    case 'baixa':
      return 'rgba(74, 222, 128, 0.8)';
    default:
      return 'rgba(156, 163, 175, 0.8)';
  }
};

export default function GraficoEventos({ dados }: Props) {
  const labels = dados.map((e) => e.prioridade);
  const valores = dados.map((e) => e.quantidade);
  const cores = dados.map((e) => getPrioridadeColor(e.prioridade));

  const totalEventos = valores.reduce((acc, val) => acc + val, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
            <FaCalendarAlt className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Eventos por Prioridade
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Distribuição dos eventos cadastrados
            </p>
          </div>
        </div>
      </div>

      {/* Total de Eventos */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {totalEventos}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total de Eventos</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="p-6">
        <div className="h-64 flex justify-center items-center">
          <Pie
            data={{
              labels,
              datasets: [
                {
                  label: 'Eventos por Prioridade',
                  data: valores,
                  backgroundColor: cores,
                  borderColor: cores.map(cor => cor.replace('0.8', '1')),
                  borderWidth: 2,
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
                  borderColor: 'rgba(139, 92, 246, 1)',
                  borderWidth: 1,
                  cornerRadius: 8,
                  callbacks: {
                    label: function(context: any) {
                      const percentage = ((context.parsed / totalEventos) * 100).toFixed(1);
                      return `${context.label}: ${context.parsed} (${percentage}%)`;
                    }
                  }
                },
              },
            }}
          />
        </div>

        {/* Legenda Customizada */}
        <div className="mt-6 space-y-3">
          {dados.map((item, index) => {
            const percentage = ((item.quantidade / totalEventos) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getPrioridadeIcon(item.prioridade)}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.prioridade}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {item.quantidade}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}