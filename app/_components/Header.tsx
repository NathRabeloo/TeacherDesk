"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  date: string;
  title?: string;
  buttonText?: string;
  buttonLink?: string;
  desktopImageLeft?: string;  // Imagem à esquerda em desktop
  desktopImageRight?: string; // Imagem à direita em desktop (opcional)
  mobileImage?: string;       // Imagem em dispositivos móveis
  showOnlyLeftImage?: boolean; // Nova prop para mostrar apenas a imagem da esquerda
}

const Header: React.FC<HeaderProps> = ({ 
  date, 
  title, 
  buttonText, 
  buttonLink, 
  desktopImageLeft,
  desktopImageRight,
  mobileImage,
  showOnlyLeftImage = false
}) => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Usuário");

  const handleButtonClick = () => {
    if (buttonLink) {
      router.push(buttonLink);
    }
  };

  return (
    <div className="w-full max-w-8xl h-auto min-h-[150px] md:min-h-[180px] bg-[#5A9BF6] dark:bg-dark-secondary p-3 md:p-6 rounded-xl flex flex-col sm:flex-row items-center text-white shadow-lg relative overflow-hidden">
      
      <div className="w-[60%] text-left space-y-1 md:space-y-2 z-10">
        <p className="text-xs md:text-sm">{date}</p>
        <h1 className="text-xl md:text-2xl font-bold">
          {title ? title.replace("{userName}", userName) : `Bem-vinde, ${userName}!`}
        </h1>

        {buttonText && (
          <button
            className="mt-1 md:mt-2 bg-[#4A86E8] dark:bg-dark-accent px-3 md:px-6 py-1 md:py-2 rounded-lg text-white flex items-center gap-1 md:gap-2 hover:bg-[#3B76D4] dark:hover:bg-blue-600 text-xs md:text-sm"
            onClick={handleButtonClick}
          >
            {buttonText}
          </button>
        )}
      </div>

      {/* Imagem para mobile/tablet */}
      <div className="block sm:block lg:hidden absolute inset-0 pointer-events-none">
        {mobileImage && (
          <img
            src={mobileImage}
            alt="Imagem mobile"
            className="absolute right-2 bottom-[0px] max-h-[140px] object-contain"
          />
        )}
      </div>

      {/* Imagens para desktop */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        {/* Imagem à esquerda (personalizada ou padrão) */}
        {desktopImageLeft ? (
          <img
            src={desktopImageLeft}
            alt="Imagem à esquerda"
            className={`absolute ${showOnlyLeftImage ? 'right-10' : 'left-1/2 -translate-x-1/2'} bottom-[-0px] max-h-[180px] object-contain`}
          />
        ) : title !== "Bibliografia" && (
          <img
            src="/assets/avatar/fem1.png"
            alt="Avatar Usuario"
            className={`absolute ${showOnlyLeftImage ? 'right-10' : 'left-1/2 -translate-x-1/2'} bottom-[-0px] max-h-[180px] object-contain`}
          />
        )}

        {/* Imagem à direita (personalizada ou padrão) - somente exibida se showOnlyLeftImage for false */}
        {!showOnlyLeftImage && desktopImageRight && (
          <img
            src={desktopImageRight}
            alt="Imagem à direita"
            className="absolute right-10 bottom-[-10px] max-h-[180px] object-contain"
          />
        )}
        
      </div>
    </div>
  );
};

export default Header;