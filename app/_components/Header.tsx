"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  date: string;
  title?: string;
  buttonText?: string;
  buttonLink?: string;
  desktopImageLeft?: string;
  desktopImageRight?: string;
  mobileImage?: string;
  showOnlyLeftImage?: boolean;
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
    <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 mb-6">
      <div className="w-full h-auto min-h-[140px] bg-gradient-to-r from-blue-500 to-purple-600 dark:from-gray-700 dark:to-gray-600 p-4 md:p-6 rounded-none flex flex-col sm:flex-row items-center text-white relative overflow-hidden">
        
        <div className="w-full sm:w-[60%] text-left space-y-1 md:space-y-2 z-10">
          <p className="text-xs md:text-sm opacity-90">{date}</p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            {title ? title.replace("{userName}", userName) : `Bem-vinde, ${userName}!`}
          </h1>

          {buttonText && (
            <button
              className="mt-2 md:mt-3 bg-white/20 backdrop-blur-sm border border-white/30 px-4 md:px-6 py-2 md:py-3 rounded-lg text-white flex items-center gap-2 hover:bg-white/30 transition-all duration-200 text-sm md:text-base font-semibold shadow-lg"
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
              className="absolute right-2 bottom-0 max-h-[120px] object-contain opacity-80"
            />
          )}
        </div>

        {/* Imagens para desktop */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          {desktopImageLeft ? (
            <img
              src={desktopImageLeft}
              alt="Imagem à esquerda"
              className={`absolute ${showOnlyLeftImage ? 'right-10' : 'left-1/2 -translate-x-1/2'} bottom-0 max-h-[140px] object-contain opacity-80`}
            />
          ) : title !== "Bibliografia" && (
            <img
              src="/assets/avatar/fem1.png"
              alt="Avatar Usuario"
              className={`absolute ${showOnlyLeftImage ? 'right-10' : 'left-1/2 -translate-x-1/2'} bottom-0 max-h-[140px] object-contain opacity-80`}
            />
          )}

          {!showOnlyLeftImage && desktopImageRight && (
            <img
              src={desktopImageRight}
              alt="Imagem à direita"
              className="absolute right-10 bottom-0 max-h-[140px] object-contain opacity-80"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;