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
        { name: "Quizzes", icon: <FaQuestionCircle size={24} />, route: "/home/quizzes", description: "Crie Quizzes para seus alunos" },
        { name: "Enquetes", icon: <FaPoll size={24} />, route: "/home/enquete", description: "Faça uma votação em sala de aula" },
        { name: "Relatórios", icon: <FaFileAlt size={24} />, route: "/home/relatorios", description: "Gerencie participação com relatórios" },
        { name: "Sorteador", icon: <FaRandom size={24} />, route: "/home/sorteador", description: "Sorteie grupos, alunos ou números" },
        { name: "Tutoriais", icon: <FaChalkboardTeacher size={24} />, route: "/home/tutoriais", description: "Veja tutoriais disponíveis" },
        { name: "Calendário", icon: <FaCalendarAlt size={24} />, route: "/home/calendario", description: "Gerencie compromissos" },
        { name: "Modelos", icon: <FaTable size={24} />, route: "/home/modelos", description: "Acesse modelos personalizados" },
        { name: "Bibliografia", icon: <FaBook size={24} />, route: "/home/bibliografia", description: "Adicione livros e sites" },
        { name: "Diário de Aulas", icon: <FaClipboardList size={24} />, route: "/home/plano-aulas", description: "Acompanhe a execução do seu plano de aulas" },
    ];
    
    const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return(
        <>
            <FeatureGrid
                items={filteredItems}
                onItemClick={(item) => router.push(item.route)}
            />
        </>
    )
}