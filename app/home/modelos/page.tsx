import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FaFileDownload } from 'react-icons/fa';

// Base URL do bucket público
const BASE_URL = "https://klrdcdnkvdtjoiuwgcaw.supabase.co/storage/v1/object/public/arquivos-modelos/";

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
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Modelos para Download</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {arquivos.map((arquivo, index) => (
          <Card key={index}>
            <CardContent className="flex flex-col items-center p-4 text-center">
              <FaFileDownload className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{arquivo.titulo}</h3>
              <p className="text-gray-600 mb-4">{arquivo.descricao}</p>
              <a
                href={`${BASE_URL}${encodeURIComponent(arquivo.nomeArquivo)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Baixar
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
