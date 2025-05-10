"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  FaBars, 
  FaHome, 
  FaUser, 
  FaCog, 
  FaBell, 
  FaSignOutAlt,
} from "react-icons/fa";

import { ThemeSwitcher } from "./DarkModeToggle";

import {signOutAction} from "@/app/actions"

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  route: string;
}

const Sidebar: React.FC = () => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Detectar se está em dispositivo móvel
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile && !localStorage.getItem('sidebarState')) {
        setIsExpanded(false);
      } else if (!mobile) {
        setIsExpanded(true);
      }
    };
    
    // Recuperar estado da sidebar para dispositivos móveis
    const savedState = localStorage.getItem('sidebarState');
    if (savedState && window.innerWidth < 1024) {
      setIsExpanded(savedState === 'expanded');
    }
    
    handleResize(); // Chamar uma vez ao montar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      const newState = !isExpanded;
      setIsExpanded(newState);
      localStorage.setItem('sidebarState', newState ? 'expanded' : 'collapsed');
    }
  };
  

  const menuItems: MenuItem[] = [
    { name: "Página Principal", icon: <FaHome size={20} />, route: "/home" },
    { name: "Meu Perfil", icon: <FaUser size={20} />, route: "/profile" },
    { name: "Configurações", icon: <FaCog size={20} />, route: "/settings" },
    { name: "Notificações", icon: <FaBell size={20} />, route: "/notifications" },
  ];

  const handleMenuClick = (route: string) => {
    router.push(route);
    // Em dispositivos móveis, fechamos a sidebar após a navegação
    if (isMobile) {
      setIsExpanded(false);
      localStorage.setItem('sidebarState', 'collapsed');
    }
  };

  return (
    <div className={`h-[90vh] ${isExpanded ? 'w-56' : 'w-20'} hidden md:flex bg-blue-400 dark:bg-dark-secondary text-white border border-blue-300 dark:border-dark-border rounded-3xl flex-col pt-6 pb-4 px-4 shadow-lg ml-4 mt-6 mb-4 transition-all duration-300`}>
      
      {/* Cabeçalho da Sidebar */}
      <div className="flex justify-between items-center mb-4">
        {/* Botão hambúrguer apenas para mobile/tablet */}
        {isMobile && (
          <button 
            onClick={toggleSidebar} 
            className="text-white p-2 hover:bg-blue-500 dark:hover:bg-dark-hover rounded-lg"
            aria-label="Toggle sidebar"
          >
            <FaBars size={24} />
          </button>
        )}
        
        {/* Logo exibida apenas em dispositivos não-móveis */}
        {!isMobile && (
          <img 
            src="/assets/teacher_desk_logo.png" 
            alt="Teacher Desk Logo" 
            className={`${isExpanded ? 'w-40' : 'w-12'} h-auto mx-auto transition-all duration-300`} 
          />
        )}
      </div>

      <hr className="border-gray-300 dark:border-gray-600 mb-4" />

      {/* Itens do Menu */}
      <nav className="flex-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleMenuClick(item.route)}
            className="flex items-center w-full text-left p-3 hover:bg-blue-500 dark:hover:bg-dark-hover rounded-lg mb-2"
          >
            <div className={`w-8 h-8 flex items-center justify-center ${!isExpanded && 'mx-auto'}`}>
              {item.icon}
            </div>
            {isExpanded && <span className="ml-3">{item.name}</span>}
          </button>
        ))}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="mt-auto">
        <hr className="border-gray-300 dark:border-gray-600 my-4"/>
        <div className="flex items-center lg:justify-between justify-center gap-3 lg:p-3">
          {isExpanded && <span className="">Modo Escuro</span>}
          {/* Dark Mode */}
          <ThemeSwitcher/>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOutAction()}
          className="flex items-center w-full text-left p-3 hover:bg-blue-500 dark:hover:bg-dark-hover rounded-lg"
        >
          <div className={`w-8 h-8 flex items-center justify-center ${!isExpanded && 'mx-auto'}`}>
            <FaSignOutAlt size={20} />
          </div>
          {isExpanded && <span className="ml-3">Sair Da Conta</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;