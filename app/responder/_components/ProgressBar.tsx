"use client";

import React from "react";

type ProgressBarProps = {
  current: number;
  total: number;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progresso = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
        <span>Progresso</span>
        <span>{Math.round(progresso)}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progresso}%` }}
        ></div>
      </div>
    </div>
  );
};

