import React from 'react';
import { Card, CardContent } from "@/components/ui/card";  // Adapte para seu estilo de componente de card
import { FaFileDownload } from 'react-icons/fa';  // Usando Font Awesome, instale react-icons

export default function Modelos() {
  const modelos = [
    {
      titulo: "Modelo de Slides",
      descricao: "Modelo de slides com o ícone da instituição para apresentações.",
      link: "/modelos/slides.pptx",  // Caminho do arquivo
    },
    {
      titulo: "Documento da Secretaria",
      descricao: "Modelo de documento oficial da secretaria para comunicados.",
      link: "/modelos/documento_secretaria.docx",
    },
    {
      titulo: "Relatório de Aulas",
      descricao: "Modelo de relatório para registrar as atividades das aulas.",
      link: "/modelos/relatorio_aulas.pdf",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {modelos.map((modelo, index) => (
        <Card key={index}>
          <CardContent className="flex flex-col items-center p-4 text-center">
            <FaFileDownload className="text-4xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{modelo.titulo}</h3>
            <p className="text-gray-600 mb-4">{modelo.descricao}</p>
            <a
              href={modelo.link}
              download
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Baixar
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
