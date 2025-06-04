"use client";

import FeatureGrid from "./FeatureGrid";

import {
  FaQuestionCircle,
  FaPoll,
  FaRandom,
  FaChalkboardTeacher,
  FaTable,
  FaBook,
  FaFileAlt,
  FaCalendarAlt,
  FaClipboardList,
} from "react-icons/fa";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Grid() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const items = [
        { 
            name: "Quizzes", 
            icon: <FaQuestionCircle size={32} />, 
            route: "/home/quizzes", 
            description: "Crie Quizzes interativos para seus alunos",
            gradient: "from-blue-500 to-blue-600"
        },
        { 
            name: "Enquetes", 
            icon: <FaPoll size={32} />, 
            route: "/home/enquete", 
            description: "Faça votações dinâmicas em sala de aula",
            gradient: "from-green-500 to-green-600"
        },
        { 
            name: "Relatórios", 
            icon: <FaFileAlt size={32} />, 
            route: "/home/relatorios", 
            description: "Gerencie participação com relatórios detalhados",
            gradient: "from-purple-500 to-purple-600"
        },
        { 
            name: "Sorteador", 
            icon: <FaRandom size={32} />, 
            route: "/home/sorteador", 
            description: "Sorteie grupos, alunos ou números aleatoriamente",
            gradient: "from-pink-500 to-pink-600"
        },
        { 
            name: "Tutoriais", 
            icon: <FaChalkboardTeacher size={32} />, 
            route: "/home/tutoriais", 
            description: "Acesse tutoriais e guias completos",
            gradient: "from-indigo-500 to-indigo-600"
        },
        { 
            name: "Calendário", 
            icon: <FaCalendarAlt size={32} />, 
            route: "/home/calendario", 
            description: "Organize e gerencie seus compromissos",
            gradient: "from-orange-500 to-orange-600"
        },
        { 
            name: "Modelos", 
            icon: <FaTable size={32} />, 
            route: "/home/modelos", 
            description: "Acesse modelos personalizados e templates",
            gradient: "from-teal-500 to-teal-600"
        },
        { 
            name: "Bibliografia", 
            icon: <FaBook size={32} />, 
            route: "/home/bibliografia", 
            description: "Gerencie livros e referências bibliográficas",
            gradient: "from-yellow-500 to-yellow-600"
        },
        { 
            name: "Diário de Aulas", 
            icon: <FaClipboardList size={32} />, 
            route: "/home/plano-aulas", 
            description: "Acompanhe a execução do seu plano de aulas",
            gradient: "from-red-500 to-red-600"
        },
    ];
    
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 overflow-hidden">
            <FeatureGrid
                items={filteredItems}
                onItemClick={(item) => router.push(item.route)}
            />
        </div>
    );
}