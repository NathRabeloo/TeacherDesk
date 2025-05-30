'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FaFileDownload } from 'react-icons/fa'

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
    }
  ]

  const [paginaAtual, setPaginaAtual] = useState(1)
  const [busca, setBusca] = useState('')
  const itensPorPagina = 12

  // Filtra os arquivos com base no título
  const arquivosFiltrados = arquivos.filter((arquivo) =>
    arquivo.titulo.toLowerCase().includes(busca.toLowerCase())
  )

  // Calcula o total de páginas e pega os arquivos da página atual
  const totalPaginas = Math.ceil(arquivosFiltrados.length / itensPorPagina)
  const arquivosPaginados = arquivosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  )

  // Muda a página da lista de arquivos
  const mudarPagina = (novaPagina: number) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina)
    }
  }

  return (
    <div className="min-h-screen bg-blue-100 flex justify-center items-start py-10">
      <div className="bg-white rounded-3xl shadow-md w-full max-w-7xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Modelos para Download</h1>

        <div className="flex justify-center mb-8">
          <Input
            placeholder="Buscar por título..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              setPaginaAtual(1)
            }}
            className="w-full max-w-md"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {arquivosPaginados.map((arquivo, index) => (
            <Card key={index} className="h-full">
              <CardContent className="flex flex-col justify-between p-6 h-full text-center">
                <div>
                  <FaFileDownload className="text-5xl text-blue-600 mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2">{arquivo.titulo}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{arquivo.descricao}</p>
                </div>
                <a
                  href={`${BASE_URL}${encodeURIComponent(arquivo.nomeArquivo)}`}
                  download
                  className="w-full mt-auto bg-blue-400 text-white text-sm py-2 px-4 rounded-md hover:bg-blue-500"
                >
                  Baixar
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex justify-center mt-10 space-x-2">
            <Button
              variant="outline"
              onClick={() => mudarPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
            >
              Anterior
            </Button>
            {[...Array(totalPaginas)].map((_, i) => (
              <Button
                key={i}
                variant={i + 1 === paginaAtual ? 'default' : 'outline'}
                onClick={() => mudarPagina(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => mudarPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
