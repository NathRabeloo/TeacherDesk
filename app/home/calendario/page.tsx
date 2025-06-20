"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CalendarioVisual from "../../_components/CalendarioVisual";
import { FaCalendarAlt, FaUsers, FaChartBar, FaClock, FaCalendarPlus, FaCalendarCheck } from "react-icons/fa";

const Calendario = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Área Principal do Conteúdo - Calendário */}
            <CalendarioVisual />
        </div>
        </div>
  );
};

export default Calendario;