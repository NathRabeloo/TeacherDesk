"use client";

import React from "react";
import { XCircle } from "lucide-react";

type ErrorScreenProps = {
  title?: string;
  message?: string;
};

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  title = "Quiz não encontrado", 
  message = "O questionário solicitado não foi encontrado." 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="p-12 text-center">
            <XCircle className="mx-auto text-6xl text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

