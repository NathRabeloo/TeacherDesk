import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FaFileDownload, FaFileWord, FaFilePowerpoint, FaDownload, FaFolder, FaCloudDownloadAlt } from 'react-icons/fa';

// Base URL do bucket público
const BASE_URL = "https://klrdcdnkvdtjoiuwgcaw.supabase.co/storage/v1/object/public/arquivos-modelos/";

const getFileIcon = (filename: string) => {
  if (filename.includes('.docx') || filename.includes('.doc')) {
    return FaFileWord;
  } else if (filename.includes('.pptx') || filename.includes('.ppt')) {
    return FaFilePowerpoint;
  }
  return FaFileDownload;
};

const getFileGradient = (filename: string) => {
  if (filename.includes('.docx') || filename.includes('.doc')) {
    return "from-blue-500 to-blue-600";
  } else if (filename.includes('.pptx') || filename.includes('.ppt')) {
    return "from-orange-500 to-red-600";
  }
  return "from-gray-500 to-gray-600";
};

export default function Modelos() {
  const arquivos = [
    {
      titulo: "Ementa Modelo",
      descricao: "Documento modelo para a ementa das disciplinas.",
      nomeArquivo: "Ementa_Modelo.docx",
    },
    {
      titulo: "Slide Modelo",
      descricao: "Modelo de slide institucional para apresentações.",
      nomeArquivo: "Slide_Modelo.pptx",
    },
    // Pode adicionar mais arquivos aqui...
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <FaFolder className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Modelos para Download
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Acesse e baixe documentos modelo prontos para uso
                </p>
              </div>
            </div>
            
            {/* Estatísticas Rápidas */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-2">
                  <FaFileWord className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Word</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full mb-2">
                  <FaFilePowerpoint className="text-orange-600 dark:text-orange-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">PowerPoint</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-2">
                  <FaCloudDownloadAlt className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Downloads</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cabeçalho do Conteúdo */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
                  <FaDownload className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Biblioteca de Modelos
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                    Escolha e baixe os modelos disponíveis
                  </p>
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg">
                <span className="text-blue-800 dark:text-blue-200 font-semibold">
                  {arquivos.length} modelos disponíveis
                </span>
              </div>
            </div>
          </div>

          {/* Grid de Cartões de Modelos */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {arquivos.map((arquivo, index) => {
                const IconComponent = getFileIcon(arquivo.nomeArquivo);
                const gradient = getFileGradient(arquivo.nomeArquivo);
                
                return (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-800"
                  >
                    <CardContent className="flex flex-col items-center p-8 text-center space-y-6">
                      <div className={`bg-gradient-to-r ${gradient} p-4 rounded-2xl shadow-lg`}>
                        <IconComponent className="text-4xl text-white" />
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {arquivo.titulo}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                          {arquivo.descricao}
                        </p>
                      </div>

                      <div className="w-full space-y-3">
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                          <span className="font-mono">{arquivo.nomeArquivo}</span>
                        </div>
                        
                        <a
                          href={`${BASE_URL}${encodeURIComponent(arquivo.nomeArquivo)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r ${gradient} text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 no-underline`}
                        >
                          <FaDownload className="text-lg" />
                          Baixar Modelo
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {arquivos.length === 0 && (
              <div className="text-center py-16">
                <div className="flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-6">
                  <FaFileDownload className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Nenhum modelo disponível
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Os modelos serão adicionados em breve.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="bg-white dark:bg-gray-800 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="text-lg">Biblioteca de Modelos Institucionais</p>
            <p className="text-sm mt-2">Facilitando a criação de documentos padronizados</p>
          </div>
        </div>
      </div>
    </div>
  );
}