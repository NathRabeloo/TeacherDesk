"use client";

import React from "react";
import FeatureCard from "./FeatureCard";

interface Item {
  name: string;
  icon: JSX.Element;
  route: string;
  description: string;
  gradient: string;
}

interface FeatureGridProps {
  items: Item[];
  onItemClick: (item: Item) => void;
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ items, onItemClick }) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Ferramentas Disponíveis
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            Selecione uma ferramenta para começar
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="p-6 h-full overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-fit">
            {items.length > 0 ? (
              items.map((item, index) => (
                <FeatureCard
                  key={index}
                  name={item.name}
                  icon={item.icon}
                  description={item.description}
                  gradient={item.gradient}
                  onClick={() => onItemClick(item)}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                <p className="text-lg">Nenhum item encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureGrid;