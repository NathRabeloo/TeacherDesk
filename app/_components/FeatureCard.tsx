"use client";

import React from "react";

interface FeatureCardProps {
  name: string;
  icon: JSX.Element;
  description: string;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ name, icon, description, onClick }) => {
  return (
    <div
      className=" bg-blue-200 dark:bg-dark-card  mx-2 mt-5 lg:m-0 rounded-lg text-center text-blue-800 dark:text-dark-text cursor-pointer hover:bg-blue-300 dark:hover:bg-dark-hover transition transform flex flex-col items-center justify-center h-40"
      onClick={onClick}
    >
      <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 text-sm bg-black text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
        {description}
      </span>

      <div className="mb-2 flex justify-center items-center h-8 md:h-10 dark:text-dark-accent">
        {icon}
      </div>

      <p className="font-semibold text-sm md:text-base">{name}</p>
    </div>
  );
};

export default FeatureCard;
