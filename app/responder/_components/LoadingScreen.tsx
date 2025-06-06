"use client";

import React from "react";

type LoadingScreenProps = {
  message?: string;
  subMessage?: string;
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Carregando...", 
  subMessage 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{message}</h2>
            {subMessage && (
              <p className="text-lg text-gray-600 dark:text-gray-300">{subMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

