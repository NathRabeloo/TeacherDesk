import React, { useState, useEffect } from "react";
import ModalAddEvento, { Evento } from "./ModalAddEvento";

const daysOfWeek = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

const Calendar = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Inicializa com o mês e ano atuais
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // Mês atual (0 a 11)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Ano atual

  const getPrioridade = (dataEvento: string): "alta" | "media" | "baixa" => {
    const hoje = new Date();
    const evento = new Date(dataEvento);
    const diffDias = Math.ceil((evento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias <= 3) return "alta";
    if (diffDias <= 7) return "media";
    return "baixa";
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

  const diasDoMes = new Date(currentYear, currentMonth + 1, 0).getDate(); // Pega o número de dias do mês atual
  const inicioSemana = new Date(currentYear, currentMonth, 1).getDay(); // Primeiro dia do mês
  const totalCelulas = 35;

  // Função para mudar o mês
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

  return (
    <div className="flex flex-row max-w-7xl mx-auto bg-white shadow rounded-xl p-6 w-full h-full">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => changeMonth(-1)}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
          >
            Mês Anterior
          </button>
          <h2 className="text-2xl font-bold">
            Calendário - {new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long' })} {currentYear}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
          >
            Próximo Mês
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold"
          >
            NOVO REGISTRO
          </button>
        </div>

        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-600">
          {daysOfWeek.map((day, idx) => (
            <div key={idx}>{day}</div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-2 mt-2 text-center text-sm">
          {Array.from({ length: inicioSemana }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20" />
          ))}

          {Array.from({ length: diasDoMes }).map((_, diaIndex) => {
            const dia = diaIndex + 1;
            const dataStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${dia.toString().padStart(2, "0")}`;
            const eventosDoDia = eventos.filter((e) => e.data === dataStr);

            // Descobre a maior prioridade do dia
            let prioridadeMaisAlta: "alta" | "media" | "baixa" | "" = "";
            const prioridades = eventosDoDia.map((e) => getPrioridade(e.data));
            if (prioridades.includes("alta")) {
              prioridadeMaisAlta = "alta";
            } else if (prioridades.includes("media")) {
              prioridadeMaisAlta = "media";
            } else if (prioridades.includes("baixa")) {
              prioridadeMaisAlta = "baixa";
            }

            const cor = getCorPrioridade(prioridadeMaisAlta);

            return (
              <div
                key={dia}
                className={`h-20 p-1 border rounded-lg relative ${cor}`}
              >
                <div className="absolute top-1 left-1 text-xs text-gray-700">{dia}</div>
                <div className="mt-5 space-y-1 text-[10px]">
                  {eventosDoDia.map((evento, idx) => {
                    const prioridade = getPrioridade(evento.data);
                    const corIndicador =
                      prioridade === "alta"
                        ? "bg-red-500"
                        : prioridade === "media"
                        ? "bg-orange-400"
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
      <div className="w-64 pl-4 border-l border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Eventos</h3>
        {eventos.map((evento, idx) => {
          const prioridade = getPrioridade(evento.data);
          const corBadge =
            prioridade === "alta"
              ? "bg-red-500"
              : prioridade === "media"
              ? "bg-yellow-400"
              : "bg-green-500";

          return (
            <div
              key={idx}
              className="bg-white shadow p-2 rounded-lg mb-2 text-sm border"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{evento.nome}</span>
                <span
                  className={`text-xs text-white px-2 py-0.5 rounded-full ${corBadge}`}
                >
                  {prioridade.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600">{evento.descricao}</p>
              <p className="text-xs text-gray-500">{evento.data}</p>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <ModalAddEvento
          onAdd={(evento) => setEventos([...eventos, evento])}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Calendar;

