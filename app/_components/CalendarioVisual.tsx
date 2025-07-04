"use client";

import React, { useState, useEffect } from "react";
import ModalAddEvento, { Evento } from "./ModalAddEvento";
import { createClient } from "@/lib/utils/supabase/client";
import { FaExclamationTriangle, FaCalendarAlt, FaPlus, FaChevronLeft, FaChevronRight, FaBell, FaCalendarDay, FaClock, FaFlag, FaCheck } from "react-icons/fa";

const daysOfWeek = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];
const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const supabase = createClient();
const Calendar = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [eventoEmEdicao, setEventoEmEdicao] = useState<Evento | null>(null);
  const [showEventosProximos, setShowEventosProximos] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const hoje = new Date();
  const diaAtual = (hoje.getFullYear() === currentYear && hoje.getMonth() === currentMonth) ? hoje.getDate() : null;

  // Função para recarregar eventos do banco
  const fetchEventos = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("Evento")
      .select("id, nome, data, descricao, prioridade")
      .eq("usuarioId", user.id)
      .is("deletedAt", null)
      .order("data", { ascending: true });

    if (!error) {
      const eventosConvertidos = (data || []).map(ev => ({
        ...ev,
        data: ev.data.split("T")[0],
        prioridade: ev.prioridade || "baixa"
      }));
      setEventos(eventosConvertidos);
    } else {
      console.error("Erro ao carregar eventos:", error.message);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const formatDateBR = (dateString: string) => {
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const getCorPrioridade = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return "bg-red-50 border-red-200";
      case "media":
        return "bg-yellow-50 border-yellow-200";
      case "baixa":
        return "bg-green-50 border-green-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  const getCorIndicador = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return "bg-red-500";
      case "media":
        return "bg-yellow-500";
      case "baixa":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const diasDoMes = new Date(currentYear, currentMonth + 1, 0).getDate();
  const inicioSemana = new Date(currentYear, currentMonth, 1).getDay();

  const changeMonth = (increment: number) => {
    let newMonth = currentMonth + increment;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const abrirModalEdicao = (evento: Evento) => {
    setEventoEmEdicao(evento);
    setSelectedDate("");
    setShowModal(true);
  };

  const abrirModalNovoEvento = (dataStr?: string) => {
    setEventoEmEdicao(null);
    setSelectedDate(dataStr || "");
    setShowModal(true);
  };

  const handleDayClick = (dia: number) => {
    const dataStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${dia.toString().padStart(2, "0")}`;
    abrirModalNovoEvento(dataStr);
  };

  const removerEvento = async (id: number) => {
    try {
      // Atualização no Supabase
      const { error } = await supabase
        .from("Evento")
        .update({ deletedAt: new Date().toISOString() })
        .eq("id", id);

      if (!error) {
        // Atualização local
        setEventos((oldEventos) => oldEventos.filter((ev) => ev.id !== id));
      } else {
        console.error("Erro ao remover evento:", error.message);
      }
    } catch (error) {
      console.error("Erro ao remover evento:", error);
    }
  };

  // Função para marcar evento como concluído
  const marcarComoConcluido = async (id: number) => {
    try {
      const { error } = await supabase
        .from("Evento")
        .update({ deletedAt: new Date().toISOString() })
        .eq("id", id);

      if (!error) {
        // Remove o evento da lista local
        setEventos((oldEventos) => oldEventos.filter((ev) => ev.id !== id));
      } else {
        console.error("Erro ao marcar evento como concluído:", error.message);
      }
    } catch (error) {
      console.error("Erro ao marcar evento como concluído:", error);
    }
  };

  // Função para atualizar evento
  const atualizarEvento = (eventoAtualizado: Evento) => {
    setEventos((oldEventos) =>
      oldEventos.map((ev) => (ev.id === eventoAtualizado.id ? eventoAtualizado : ev))
    );
  };

  // Função para adicionar novo evento
  const adicionarEvento = (novoEvento: Evento) => {
    setEventos((oldEventos) => [...oldEventos, novoEvento]);
  };

  // Função chamada quando o modal é fechado após uma ação
  const handleModalClose = () => {
    setShowModal(false);
    setEventoEmEdicao(null);
    setSelectedDate("");
    // Recarrega os eventos para garantir sincronização
    fetchEventos();
  };

  // Eventos próximos nos próximos 3 dias
  const eventosProximos = eventos.filter(ev => {
    const dataEv = new Date(ev.data);
    const hoje = new Date();
    const daqui3Dias = new Date();
    daqui3Dias.setDate(hoje.getDate() + 3);

    dataEv.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);

    return dataEv >= hoje && dataEv <= daqui3Dias;
  });

  return (
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
                Organize e gerencie seus compromissos importantes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação do Calendário */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => changeMonth(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-semibold transition-all duration-200"
            >
              <FaChevronLeft />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {monthNames[currentMonth]} {currentYear}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => changeMonth(1)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-semibold transition-all duration-200"
              >
                <span className="hidden sm:inline">Próximo</span>
                <FaChevronRight />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowEventosProximos(!showEventosProximos)}
                  className={`p-3 rounded-xl font-semibold transition-all duration-200 ${
                    eventosProximos.length > 0 
                      ? 'bg-yellow-500 text-white shadow-lg' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}
                  title="Eventos próximos"
                >
                  <FaBell className="text-lg" />
                  {eventosProximos.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {eventosProximos.length}
                    </span>
                  )}
                </button>

                {/* Lista suspensa de eventos próximos */}
                {showEventosProximos && (
                  <div className="absolute right-0 top-14 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-4 w-80 z-50 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Próximos eventos:</h4>
                    {eventosProximos.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {eventosProximos.map((ev, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                              <strong className="text-gray-900 dark:text-white">{ev.nome}</strong>
                              <span className={`w-3 h-3 rounded-full ${getCorIndicador(ev.prioridade)}`}></span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{formatDateBR(ev.data)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{ev.descricao}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum evento próximo.</p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => abrirModalNovoEvento()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FaPlus />
                <span className="hidden sm:inline">Novo Evento</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendário Principal */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <FaCalendarAlt className="text-white text-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Calendário do Mês
                  </h3>
                </div>
              </div>

              <div className="p-6">
                {/* Cabeçalho dos dias da semana */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {daysOfWeek.map((day, idx) => (
                    <div key={idx} className="text-center py-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Grid do calendário */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Dias vazios do início */}
                  {Array.from({ length: inicioSemana }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-24 rounded-lg" />
                  ))}

                  {/* Dias do mês */}
                  {Array.from({ length: diasDoMes }).map((_, diaIndex) => {
                    const dia = diaIndex + 1;
                    const dataStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${dia.toString().padStart(2, "0")}`;
                    const eventosDoDia = eventos.filter(e => e.data.startsWith(dataStr));
                    const isToday = diaAtual === dia;

                    return (
                      <div 
                        key={dia} 
                        className={`h-24 p-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                          isToday 
                            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-500' 
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                        onClick={() => handleDayClick(dia)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-sm font-semibold ${
                            isToday 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {dia}
                          </span>
                          {eventosDoDia.length > 0 && (
                            <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                              {eventosDoDia.length}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          {eventosDoDia.slice(0, 2).map((evento, idx) => (
                            <div 
                              key={idx} 
                              className={`text-xs p-1 rounded truncate cursor-pointer hover:shadow-sm transition-all ${getCorPrioridade(evento.prioridade)}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirModalEdicao(evento);
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${getCorIndicador(evento.prioridade)}`}></div>
                                <span className="text-gray-700 dark:text-gray-300 truncate">{evento.nome}</span>
                              </div>
                            </div>
                          ))}
                          {eventosDoDia.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                              +{eventosDoDia.length - 2} mais
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar com lista de eventos */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <FaCalendarDay className="text-white text-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Todos os Eventos
                  </h3>
                </div>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto">
                {eventos.length > 0 ? (
                  <div className="space-y-3">
                    {eventos.map((evento, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all duration-200 ${getCorPrioridade(evento.prioridade)}`}
                        onClick={() => abrirModalEdicao(evento)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">{evento.nome}</h4>
                          <div className={`w-3 h-3 rounded-full ${getCorIndicador(evento.prioridade)}`}></div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {evento.descricao}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FaClock className="text-gray-400 text-xs" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDateBR(evento.data)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaFlag className={`text-xs ${
                              evento.prioridade === 'alta' ? 'text-red-500' :
                              evento.prioridade === 'media' ? 'text-yellow-500' : 'text-green-500'
                            }`} />
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {evento.prioridade}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {/* <FaExclamationTriangle className="text-gray-400 text-4xl mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                      Nenhum evento encontrado
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                      Clique em &quot;Novo Evento&quot; para adicionar seu primeiro compromisso
                    </p> */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Adicionar/Editar Evento */}
      {showModal && (
        <ModalAddEvento
          evento={eventoEmEdicao}
          selectedDate={selectedDate}
          onAdd={(novoEvento) => {
            if (eventoEmEdicao) {
              // Editando evento existente
              atualizarEvento(novoEvento);
            } else {
              // Adicionando novo evento
              adicionarEvento(novoEvento);
            }
          }}
          onClose={handleModalClose}
          onDelete={removerEvento}
          onComplete={marcarComoConcluido} // Nova prop para marcar como concluído
        />
      )}
    </div>
  );
};

export default Calendar;