import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import { 
  FaBars, 
  FaHome, 
  FaUser, 
  FaCog, 
  FaBell, 
  FaSignOutAlt,
} from "react-icons/fa";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { ThemeToggle  } from "./DarkModeToggle";

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  route: string;
}

export default function Offcanvas() {
  
  const router = useRouter();
  const menuItems: MenuItem[] = [
    { name: "Página Principal", icon: <FaHome size={20} />, route: "/home" },
    { name: "Meu Perfil", icon: <FaUser size={20} />, route: "/profile" },
    { name: "Configurações", icon: <FaCog size={20} />, route: "/settings" },
    { name: "Notificações", icon: <FaBell size={20} />, route: "/notifications" },
  ];

  const handleMenuClick = (route: string) => {
    router.push(route);
  };

  return (
    <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline"><FaBars/></Button>
        </SheetTrigger>
        <SheetContent className="bg-blue-400 dark:bg-dark-secondary text-white border border-blue-300 dark:border-dark-border flex flex-col shadow-lg transition-all duration-300">
        <SheetHeader className="hidden">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Acesse as páginas do aplicativo e configure seu perfil.
          </SheetDescription>
        </SheetHeader>
        <div className="flex justify-between items-center mb-4">       
            <img 
              src="/assets/teacher_desk_logo.png" 
              alt="Teacher Desk Logo" 
              className="h-auto mt-3 mx-auto transition-all duration-300" 
            />
        </div>
  
        <hr className="border-gray-300 dark:border-gray-600 mb-4" />
  
        <nav className="flex-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuClick(item.route)}
              className="flex items-center w-full text-left p-3 hover:bg-blue-500 dark:hover:bg-dark-hover rounded-lg mb-2"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="ml-3">{item.name}</span>
            </button>
          ))}
        </nav>
  
        <div className="mt-auto">
          <hr className="border-gray-300 dark:border-gray-600 my-4"/>
          <div className="flex items-center lg:justify-between justify-center gap-3 lg:p-3">
            <span className="">Modo Escuro</span>
            <ThemeToggle />
          </div>
          <button
            onClick={() => handleMenuClick("/logout")}
            className="flex items-center w-full text-left p-3 hover:bg-blue-500 dark:hover:bg-dark-hover rounded-lg"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <FaSignOutAlt size={20} />
            </div>
            <span className="ml-3">Sair Da Conta</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// favicon.ico