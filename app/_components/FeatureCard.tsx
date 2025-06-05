"use client";

import React from "react";

interface FeatureCardProps {
  name: string;
  icon: JSX.Element;
  description: string;
  gradient: string;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ name, icon, description, gradient, onClick }) => {
  return (
    <div
      className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
      onClick={onClick}
    >
      <div className="flex flex-col items-center p-6 text-center space-y-4">
        <div className={`bg-gradient-to-r ${gradient} p-3 rounded-2xl shadow-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-xl leading-relaxed">
            {description}
          </p>
        </div>
        <div className={`w-full py-2 px-4 rounded-lg bg-gradient-to-r ${gradient} text-white font-semibold text-xl shadow-lg hover:shadow-xl transition-all duration-200`}>
          Acessar
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;