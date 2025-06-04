"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CalendarioVisual from "../../_components/CalendarioVisual";
import { FaCalendarAlt, FaUsers, FaChartBar, FaClock, FaCalendarPlus, FaCalendarCheck } from "react-icons/fa";

const Calendario = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <FaCalendarAlt className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Calendário de Eventos
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Organize e gerencie seus compromissos em um só lugar
                </p>
              </div>
            </div>
            
            {/* Estatísticas Rápidas */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-2">
                  <FaCalendarCheck className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Eventos</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-2">
                  <FaClock className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Próximos</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-2">
                  <FaChartBar className="text-yellow-600 dark:text-yellow-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estatísticas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Navegação */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 py-4">
            <button className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-base bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105 transition-all duration-200">
              <FaCalendarAlt className="text-xl" />
              <span className="hidden sm:inline">Visualização do Calendário</span>
              <span className="sm:hidden">Calendário</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Seção de Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cabeçalho do Conteúdo */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-blue-500">
                  <FaCalendarAlt className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Calendário de Eventos
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                    Visualize e gerencie todos os seus compromissos
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-blue-50 dark:bg-blue-900 px-4 py-2 rounded-xl">
                  <FaCalendarPlus className="text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                    Clique em "Novo Registro" para adicionar eventos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Área Principal do Conteúdo - Calendário */}
          <div className="p-8">
            <CalendarioVisual />
          </div>
        </div>

        {/* Seção de Informações Adicionais */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FaCalendarCheck className="text-green-600 dark:text-green-400 text-lg" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Eventos Ativos
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Visualize todos os seus eventos organizados por data e prioridade no calendário principal.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <FaClock className="text-yellow-600 dark:text-yellow-400 text-lg" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Próximos Eventos
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Receba alertas sobre eventos próximos nos próximos 3 dias através do ícone de notificação.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FaChartBar className="text-purple-600 dark:text-purple-400 text-lg" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Organização
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Organize seus eventos por prioridade: Alta (vermelho), Média (amarelo) e Baixa (verde).
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="bg-white dark:bg-gray-800 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="text-lg">Sistema de Gerenciamento de Eventos</p>
            <p className="text-sm mt-2">Mantenha-se organizado e nunca perca um compromisso importante</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendario;