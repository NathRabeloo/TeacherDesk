"use client";

import React, { useState, useEffect } from "react";
import ModalAddEvento, { Evento } from "./ModalAddEvento";
import { createClient } from "@/lib/utils/supabase/client";
import { FaExclamationTriangle } from "react-icons/fa"; // Ícone de alerta

const daysOfWeek = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

const Calendar = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [eventoEmEdicao, setEventoEmEdicao] = useState<Evento | null>(null);
  const [showEventosProximos, setShowEventosProximos] = useState(false);

  const hoje = new Date();
  const diaAtual = (hoje.getFullYear() === currentYear && hoje.getMonth() === currentMonth) ? hoje.getDate() : null;

  const supabase = createClient();

  useEffect(() => {
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

    fetchEventos();
  }, []);

  const formatDateBR = (dateString: string) => {
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const getCorPrioridade = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return "bg-red-200";
      case "media":
        return "bg-yellow-200";
      case "baixa":
        return "bg-green-200";
      default:
        return "bg-white";
    }
  };

  const diasDoMes = new Date(currentYear, currentMonth + 1, 0).getDate();
  const inicioSemana = new Date(currentYear, currentMonth, 1).getDay();
  const totalCelulas = 35;

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
    setShowModal(true);
  };

  const removerEvento = (id: number) => {
    setEventos((oldEventos) => oldEventos.filter((ev) => ev.id !== id));
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
    <div className="flex flex-row h-full mx-auto mt-10 bg-white shadow rounded-xl p-6 w-full relative">
      <div className="flex-1">
        <h1 className="w-full text-3xl capitalize text-center font-semibold mb-3">Calendário</h1>
        <div className="flex justify-between items-center mb-4 relative">
          <button onClick={() => changeMonth(-1)} className="bg-blue-300 text-gray-800 px-4 py-2 rounded-lg">Mês Anterior</button>

          <h2 className="text-2xl font-bold capitalize">
            {new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long' })} - {currentYear}
          </h2>

          <button onClick={() => changeMonth(1)} className="bg-blue-300 text-gray-800 px-4 py-2 rounded-lg">
            Próximo Mês
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEventoEmEdicao(null);
                setShowModal(true);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold"
            >
              NOVO REGISTRO
            </button>


            <button
              onClick={() => setShowEventosProximos(!showEventosProximos)}
              className={`p-2 rounded-full ${eventosProximos.length > 0 ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-500'} transition`}
              title="Eventos próximos"
            >
              <FaExclamationTriangle />
            </button>

            {/* Lista suspensa de eventos próximos */}
            {showEventosProximos && (
              <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg p-4 w-64 z-50">
                <h4 className="font-semibold mb-2">Próximos eventos:</h4>
                {eventosProximos.length > 0 ? (
                  <ul className="space-y-1">
                    {eventosProximos.map((ev, idx) => (
                      <li key={idx} className="text-sm border-b pb-1">
                        <strong>{ev.nome}</strong><br />
                        <span className="text-gray-500">{formatDateBR(ev.data)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum evento próximo.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-600">
          {daysOfWeek.map((day, idx) => (
            <div key={idx}>{day}</div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-2 mt-2 text-center text-sm rounded-xl p-2">
          {Array.from({ length: inicioSemana }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 border border-gray-300 rounded-lg" />
          ))}

          {Array.from({ length: diasDoMes }).map((_, diaIndex) => {
            const dia = diaIndex + 1;
            const dataStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${dia.toString().padStart(2, "0")}`;

            const eventosDoDia = eventos.filter(e => e.data.startsWith(dataStr));

            const prioridades = eventosDoDia.map((e) => e.prioridade);
            let prioridadeMaisAlta: "alta" | "media" | "baixa" | "" = "";
            if (prioridades.includes("alta")) prioridadeMaisAlta = "alta";
            else if (prioridades.includes("media")) prioridadeMaisAlta = "media";
            else if (prioridades.includes("baixa")) prioridadeMaisAlta = "baixa";

            const cor = getCorPrioridade(prioridadeMaisAlta);

            const isToday = diaAtual === dia;
            const classeDiaAtual = isToday ? "border-2 border-blue-400" : "";
            const corFinal = `${cor} ${classeDiaAtual}`;

            return (
              <div key={dia} className={`h-20 p-1 border border-gray-500 rounded-lg relative ${corFinal}`}>
                <div className="absolute top-1 left-1 text-xs text-gray-700">{dia}</div>
                <div className="mt-5 space-y-1 text-[10px]">
                  {eventosDoDia.map((evento, idx) => {
                    const corIndicador =
                      evento.prioridade === "alta" ? "bg-red-500"
                        : evento.prioridade === "media" ? "bg-orange-400"
                          : "bg-green-500";

                    return (
                      <div key={idx} className="flex items-center gap-1 truncate">
                        <span className={`w-2 h-2 rounded-full ${corIndicador}`}></span>
                        <span className="text-gray-700 truncate">{evento.nome}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {Array.from({ length: totalCelulas - inicioSemana - diasDoMes }).map((_, i) => (
            <div key={`end-empty-${i}`} className="h-20" />
          ))}
        </div>
      </div>

      {/* Barra lateral */}
      <div className="w-64 pl-4 border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Eventos</h3>
        {eventos.map((evento, idx) => {
          const corBadge =
            evento.prioridade === "alta" ? "bg-red-500"
              : evento.prioridade === "media" ? "bg-yellow-400"
                : "bg-green-500";

          return (
            <div key={idx} className="bg-white shadow p-2 rounded-lg mb-2 text-sm border">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{evento.nome}</span>

                <span className={`text-xs text-white px-2 py-0.5 rounded-full ${corBadge}`}>
                  {evento.prioridade.toUpperCase()}
                </span>
              </div>

              <div className="max-h-20 overflow-auto my-1.5">
                <p className="text-gray-600">{evento.descricao}</p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{formatDateBR(evento.data)}</p>
                <button
                  onClick={() => abrirModalEdicao(evento)}
                  className="text-blue-600 hover:underline text-xs"
                >
                  Editar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <ModalAddEvento
          evento={eventoEmEdicao}
          onAdd={(eventoEditado) => {
            if (eventoEmEdicao) {
              setEventos((oldEventos) =>
                oldEventos.map((ev) => (ev.id === eventoEditado.id ? eventoEditado : ev))
              );
            } else {
              setEventos((oldEventos) => [...oldEventos, eventoEditado]);
            }
            setShowModal(false);
            setEventoEmEdicao(null);
          }}
          onDelete={(id) => {
            removerEvento(id);
            setShowModal(false);
            setEventoEmEdicao(null);
          }}
          onClose={() => {
            setShowModal(false);
            setEventoEmEdicao(null);
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
