"use client";

import { useRouter } from "next/navigation";
import {
  FaHome,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaQuestionCircle,
  FaPoll,
  FaFileAlt,
  FaRandom,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaTable,
  FaBook,
  FaClipboardList,
} from "react-icons/fa";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { ThemeToggle } from "./DarkModeToggle";
import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

const items = [
  { name: "Quizzes", icon: <FaQuestionCircle size={20} />, route: "/home/quizzes", description: "Crie Quizzes para seus alunos" },
  { name: "Enquetes", icon: <FaPoll size={20} />, route: "/home/enquete", description: "Faça uma votação em sala de aula" },
  { name: "Relatórios", icon: <FaFileAlt size={20} />, route: "/home/relatorios", description: "Gerencie participação com relatórios" },
  { name: "Sorteador", icon: <FaRandom size={20} />, route: "/home/sorteador", description: "Sorteie grupos, alunos ou números" },
  { name: "Tutoriais", icon: <FaChalkboardTeacher size={20} />, route: "/home/tutoriais", description: "Veja tutoriais disponíveis" },
  { name: "Calendário", icon: <FaCalendarAlt size={20} />, route: "/home/calendario", description: "Gerencie compromissos" },
  { name: "Modelos", icon: <FaTable size={20} />, route: "/home/modelos", description: "Acesse modelos personalizados" },
  { name: "Bibliografia", icon: <FaBook size={20} />, route: "/home/bibliografia", description: "Adicione livros e sites" },
  { name: "Diário de Plano de aulas", icon: <FaClipboardList size={20} />, route: "/home/plano-aulas", description: "Gerencie seu diario de aulas" },
];

const MenuHeader: React.FC = () => {
  const router = useRouter();

  return (
    <header className="w-full h-16 bg-[#5A9BF6] dark:bg-dark-secondary text-white flex items-center justify-between px-6 shadow-md">
      
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold">TEACHER</span>
        <span className="italic text-white/80">Desk</span>
      </div>

      {/* Menu */}
      <nav className="flex items-center space-x-6">
        {/* Hamburguer Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-white hover:bg-blue-700 p-2">
              <FaBars size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 bg-white text-black p-1">
            {items.map((item, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => router.push(item.route)}
                className="flex flex-col items-start gap-1 px-3 py-2 hover:bg-blue-100 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </div>
                <p className="text-xs text-gray-500 ml-6">{item.description}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Navegação padrão */}
        <button onClick={() => router.push("/home")} className="flex items-center space-x-1 hover:text-gray-200">
          <FaHome />
          <span className="text-sm hidden sm:inline">Página Principal</span>
        </button>

        <button onClick={() => router.push("/header/perfil")} className="flex items-center space-x-1 hover:text-gray-200">
          <FaUser />
          <span className="text-sm hidden sm:inline">Meu Perfil</span>
          
        </button>

        <div className="hover:text-gray-200">
          <ThemeToggle />
        </div>

        <button onClick={() => signOutAction()} className="flex items-center space-x-1 hover:text-gray-200">
          <FaSignOutAlt />
          <span className="text-sm hidden sm:inline">Sair Do Site</span>
        </button>
      </nav>
    </header>
  );
};

export default MenuHeader;
