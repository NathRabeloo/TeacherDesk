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
    <header className="w-full bg-gradient-to-r from-blue-500 to-blue-300 dark:from-gray-700 dark:to-gray-600 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div
            onClick={() => router.push("/home")}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">TEACHER</span>
              <span className="italic text-gray-600 dark:text-gray-300">Desk</span>
            </div>
          </div>

          {/* Menu Navigation */}
          <nav className="flex items-center space-x-4">
            {/* Hamburguer Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-xl transition-all duration-200"
                >
                  <FaBars size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-xl rounded-xl p-2">
                {items.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => router.push(item.route)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-lg transition-all duration-200 mb-1"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} shadow-md`}>
                      {item.icon}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Navigation Buttons */}
            <Button
              onClick={() => router.push("/home")}
              variant="ghost"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 px-3 py-2 rounded-xl transition-all duration-200"
            >
              <FaHome size={16} />
              <span className="text-sm font-medium hidden sm:inline">Início</span>
            </Button>

            <Button
              onClick={() => router.push("/header/perfil")}
              variant="ghost"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 px-3 py-2 rounded-xl transition-all duration-200"
            >
              <FaUser size={16} />
              <span className="text-sm font-medium hidden sm:inline">Perfil</span>
            </Button>

            {/* Theme Toggle */}
            <div className="flex items-center justify-center p-2 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-200">
              <ThemeToggle />
            </div>

            {/* Logout Button */}
            <Button
              onClick={() => signOutAction()}
              variant="ghost"
              className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:bg-gray-300 dark:hover:bg-red-900/20 px-3 py-2 rounded-xl transition-all duration-200"
            >
              <FaSignOutAlt size={16} />
              <span className="text-sm font-medium hidden sm:inline">Sair</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default MenuHeader;