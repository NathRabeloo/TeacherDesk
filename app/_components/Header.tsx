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
  showOnlyLeftImage = false,
}) => {
  const router = useRouter();
  const [userName, setUserName] = useState("Usuário");

  const handleButtonClick = () => {
    if (buttonLink) router.push(buttonLink);
  };

  return (
    <header className="relative bg-gradient-to-r from-blue-500 to-blue-300 dark:from-gray-700 dark:to-gray-600 text-white p-6 rounded-2xl shadow-lg overflow-hidden flex flex-col sm:flex-row items-center gap-4 max-w-7xl  mx-auto mt-6">

      {/* Texto principal */}
      <div className="flex-1 z-10">
        <p className="text-sm opacity-90">{date}</p>
        <h1 className="text-2xl md:text-3xl font-bold">
          {title ? title.replace("{userName}", userName) : `Bem-vinde, ${userName}!`}
        </h1>

        {buttonText && (
          <button
            onClick={handleButtonClick}
            className="mt-3 px-6 py-2 bg-white/20 border border-white/30 rounded-full backdrop-blur-sm hover:bg-white/30 transition text-sm md:text-base font-semibold shadow-md"
          >
            {buttonText}
          </button>
        )}
      </div>

      {/* Imagem mobile */}
      {mobileImage && (
        <img
          src={mobileImage}
          alt="Imagem mobile"
          className="block sm:hidden max-h-[120px] object-contain absolute right-4 bottom-2 opacity-80 pointer-events-none"
        />
      )}

      {/* Imagens desktop */}
      <div className="hidden sm:block absolute inset-0 z-0 pointer-events-none">
        {(desktopImageLeft || title !== "Bibliografia") && (
          <img
            src={desktopImageLeft || "/assets/avatar/fem1.png"}
            alt="Imagem à esquerda"
            className={`absolute ${showOnlyLeftImage ? "right-10" : "left-1/2 -translate-x-1/2"} bottom-0 max-h-[140px] object-contain opacity-100`}
          />
        )}

        {!showOnlyLeftImage && desktopImageRight && (
          <img
            src={desktopImageRight}
            alt="Imagem à direita"
            className="absolute right-10 bottom-0 max-h-[140px] object-contain opacity-100"
          />
        )}
      </div>
    </header>
  );
};

export default Header;
