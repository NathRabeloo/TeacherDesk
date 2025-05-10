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
      className="bg-blue-200 dark:bg-dark-card mx-2 mt-5 lg:m-0 rounded-lg text-center text-blue-800 dark:text-dark-text cursor-pointer hover:bg-blue-300 dark:hover:bg-dark-hover transition transform flex flex-col items-center justify-center h-40"
      onClick={onClick}
    >
      <div className="mb-2 flex justify-center items-center h-12 md:h-14 dark:text-dark-accent">
        {icon}
      </div>

      <p className="font-semibold text-xl md:text-2xl">{name}</p>
      <p className="italic text-blue-800 dark:text-blue-600 mt-2 px-2">{description}</p>
    </div>
  );
};

export default FeatureCard;
