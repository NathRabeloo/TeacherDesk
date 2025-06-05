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
        {/* Grid de Cards */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-fit p-6 font-size">
            
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
  );
};

export default FeatureGrid;