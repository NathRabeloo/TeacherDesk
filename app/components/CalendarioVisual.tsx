"use client";

import React from "react";

const daysOfWeek = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

const Calendar = () => {
    // Mock do mês de janeiro de 2025 (começa em quarta)
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const startDay = 2; // Segunda = 0, então quarta = 2
    const totalCells = 35; // 5 semanas

    // Anotando o tipo de eventDays para garantir que as chaves sejam números específicos
    const eventDays: Record<1 | 4 | 6 | 9 | 16 | 20 | 27 | 31, string> = {
        1: "pink",
        4: "yellow",
        6: "pink",
        9: "green",
        16: "yellow",
        20: "green",
        27: "pink",
        31: "green",
    };

    const getColor = (day: number) => {
        // Verifica se o dia existe no objeto eventDays
        const color = eventDays[day as 1 | 4 | 6 | 9 | 16 | 20 | 27 | 31];
        switch (color) {
            case "pink":
                return "bg-pink-200";
            case "green":
                return "bg-green-200";
            case "yellow":
                return "bg-yellow-200";
            default:
                return "bg-white";
        }
    };

    return (
        // <div className="p-8 bg-blue-100 min-h-screen font-sans">
        <div className="max-w-5xl mx-auto bg-white shadow rounded-xl p-6 w-full">

            <h2 className="text-2xl font-bold mb-4">Calendário - Janeiro 2025</h2>

            <button className="mb-2 bg-azulteacherdesk-500px-4 py-2 rounded-lg font-semibold transition bg-blue-500  border border-blue-600">Adicionar Evento</button>

            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-600">
                {daysOfWeek.map((day, idx) => (
                    <div key={idx}>{day}</div>
                ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-2 mt-2 text-center text-sm">
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-20" />
                ))}
                {days.map((day) => (
                    <div
                        key={day}
                        className={`h-20 p-1 border rounded-lg relative ${getColor(day)}`}
                    >
                        <div className="absolute top-1 left-1 text-xs text-gray-700">
                            {day}
                        </div>
                        {/* Eventos mock */}
                        {eventDays[day as 1 | 4 | 6 | 9 | 16 | 20 | 27 | 31] && (
                            <div className="text-[10px] mt-5 text-gray-700">
                                Evento {day}
                            </div>
                        )}
                    </div>
                ))}
                {/* Preencher espaço vazio até completar a grade */}
                {Array.from({ length: totalCells - startDay - days.length }).map(
                    (_, i) => (
                        <div key={`end-empty-${i}`} className="h-20" />
                    )
                )}
            </div>
        </div>
        // </div>
    );
};

export default Calendar;
