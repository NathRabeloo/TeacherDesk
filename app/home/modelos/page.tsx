'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FaFileDownload } from 'react-icons/fa'

type Modelo = {
  titulo: string
  descricao: string
  link: string
}

export default function Modelos() {
  const modelosOriginais: Modelo[] = [
    {
      titulo: 'Modelo de Slides',
      descricao: 'Modelo de slides com o ícone da instituição para apresentações.',
      link: '/modelos/slides.pptx',
    },
    {
      titulo: 'Documento da Secretaria',
      descricao: 'Modelo de documento oficial da secretaria para comunicados.',
      link: '/modelos/documento_secretaria.docx',
    },
    {
      titulo: 'Relatório de Aulas',
      descricao: 'Modelo de relatório para registrar as atividades das aulas.',
      link: '/modelos/relatorio_aulas.pdf',
    },
    {
      titulo: 'Plano de Aula Padrão',
      descricao: 'Estrutura básica para criação de planos de aula.',
      link: '/modelos/plano_padrao.docx',
    },
    {
      titulo: 'Atividades Complementares',
      descricao: 'Modelo para planejar atividades extracurriculares.',
      link: '/modelos/atividades_complementares.pdf',
    },
    {
      titulo: 'Avaliação Diagnóstica',
      descricao: 'Modelo para avaliações iniciais dos alunos.',
      link: '/modelos/avaliacao_diagnostica.docx',
    },
    {
      titulo: 'Ficha de Observação',
      descricao: 'Documento para registrar observações em sala.',
      link: '/modelos/ficha_observacao.pdf',
    },
    {
      titulo: 'Agenda de Reuniões',
      descricao: 'Modelo para organização de reuniões pedagógicas.',
      link: '/modelos/agenda_reunioes.docx',
    },
    {
      titulo: 'Cronograma Semestral',
      descricao: 'Modelo de planejamento semestral de atividades.',
      link: '/modelos/cronograma_semestral.xlsx',
    },
    {
      titulo: 'Plano Individual de Ensino',
      descricao: 'Modelo de apoio ao ensino personalizado.',
      link: '/modelos/plano_individual.pdf',
    },
  ]

  const [paginaAtual, setPaginaAtual] = useState(1)
  const [busca, setBusca] = useState('')
  const itensPorPagina = 12

  const modelosFiltrados = modelosOriginais.filter((modelo) =>
    modelo.titulo.toLowerCase().includes(busca.toLowerCase())
  )

  const totalPaginas = Math.ceil(modelosFiltrados.length / itensPorPagina)
  const modelosPaginados = modelosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  )

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
          {modelosPaginados.map((modelo, index) => (
            <Card key={index} className="h-full">
              <CardContent className="flex flex-col justify-between p-6 h-full text-center">
                <div>
                  <FaFileDownload className="text-5xl text-blue-600 mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2">{modelo.titulo}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{modelo.descricao}</p>
                </div>
                <a
                  href={modelo.link}
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
