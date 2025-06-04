"use client";

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">TeacherDesk - Sistema de Gestão Educacional</p>
          <p className="text-xs mt-1 opacity-75">Política de Privacidade & Suporte - Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;