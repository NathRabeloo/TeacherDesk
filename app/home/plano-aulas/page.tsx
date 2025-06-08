'use client'

import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  listarDisciplinas,
  listarPlanosAula,
  criarPlanoAula,
  deletarPlanoAula,
} from '@/app/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaBookOpen, FaPlus, FaTrash, FaSearch, FaFilter } from 'react-icons/fa'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'

type Plano = {
  id: string
  titulo: string
  disciplina_id: string
  usuario_id: string
}

type Disciplina = {
  id: string
  nome: string
}

export default function PlanoAulasPage() {
  const router = useRouter()
  const [planos, setPlanos] = useState<Plano[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [disciplinaFiltro, setDisciplinaFiltro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [novoTitulo, setNovoTitulo] = useState('')
  const [novaDisciplinaId, setNovaDisciplinaId] = useState<string | null>(null)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const itensPorPagina = 9
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const carregar = async () => {
      try {
        const [disciplinasDB, planosDB] = await Promise.all([
          listarDisciplinas(),
          listarPlanosAula(),
        ])
        setDisciplinas(disciplinasDB)
        setPlanos(planosDB)
      } catch (error) {
        alert('Erro ao carregar dados')
      }
    }
    carregar()
  }, [])

  // Filtro e paginação
  const planosFiltrados = planos.filter((plano) => {
    const matchSearch = plano.titulo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchDisciplina = disciplinaFiltro ? plano.disciplina_id === disciplinaFiltro : true
    return matchSearch && matchDisciplina
  })

  const totalPaginas = Math.ceil(planosFiltrados.length / itensPorPagina)
  const planosPaginados = planosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  )

  const getDisciplinaNome = (id: string) => {
    const disc = disciplinas.find((d) => d.id === id)
    return disc ? disc.nome : 'Desconhecida'
  }

  const salvarPlano = async () => {
    if (!novoTitulo.trim() || !novaDisciplinaId) {
      alert('Preencha o título e a disciplina.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('titulo', novoTitulo)
      formData.append('disciplina_id', novaDisciplinaId)
      formData.append('cor', 'bg-orange-300')

      const { success, data } = await criarPlanoAula(formData)

      if (success && data && data.length > 0) {
        const novoPlano = data[0]
        setPlanos((prev) => [novoPlano, ...prev])
        setModalAberto(false)
        setNovoTitulo('')
        setNovaDisciplinaId(null)
        setPaginaAtual(1)
        router.push(`/home/plano-aulas/${novoPlano.id}`)
      } else {
        alert('Erro ao criar plano')
      }
    } catch (error) {
      alert('Erro ao salvar plano')
    }
    setLoading(false)
  }

  const excluirPlano = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return

    setLoading(true)
    try {
      const { success, error } = await deletarPlanoAula(id)
      if (success) {
        setPlanos((prev) => prev.filter((p) => p.id !== id))
        if (planosPaginados.length === 1 && paginaAtual > 1) {
          setPaginaAtual(paginaAtual - 1)
        }
      } else {
        alert('Erro ao excluir plano: ' + error)
      }
    } catch {
      alert('Erro ao excluir plano')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
                <FaBookOpen className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Diários de Aula
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                  Gerencie suas aulas inserindo registros em seus diários de aulas.
                </p>
              </div>
            </div>

            <Dialog open={modalAberto} onOpenChange={(open) => {
              if (!loading) setModalAberto(open)
            }}>
              <Button
                onClick={() => {
                  setNovoTitulo('')
                  setNovaDisciplinaId(null)
                  setModalAberto(true)
                }}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 text-lg font-semibold"
              >
                <FaPlus />
                Novo Diário
              </Button>

              <DialogContent className="sm:max-w-md rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-2xl bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                      <FaBookOpen className="text-white text-xl" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Adicionar Novo Diário</DialogTitle>
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo" className="text-gray-700 dark:text-gray-300 font-medium">
                      Título do Diário
                    </Label>
                    <Input
                      id="titulo"
                      placeholder="Digite o título do diário"
                      value={novoTitulo}
                      onChange={(e) => setNovoTitulo(e.target.value)}
                      disabled={loading}
                      className="rounded-lg border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="disciplina" className="text-gray-700 dark:text-gray-300 font-medium">
                      Disciplina
                    </Label>
                    <Select
                      value={novaDisciplinaId || ''}
                      onValueChange={(value) => setNovaDisciplinaId(value || null)}
                      disabled={loading}
                    >
                      <SelectTrigger className="rounded-lg border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Selecione uma disciplina" />
                      </SelectTrigger>
                      <SelectContent>
                        {disciplinas.map((disc) => (
                          <SelectItem key={disc.id} value={disc.id}>
                            {disc.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setModalAberto(false)}
                    className="rounded-lg"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={salvarPlano}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <FaPlus />
                        <span>Criar Diário</span>
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mt-8 items-center">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar diários de aula..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPaginaAtual(1)
                }}
                className="pl-10 rounded-xl border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div className="relative w-full md:w-1/3">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <Select
                value={disciplinaFiltro || 'todas'}
                onValueChange={(value) => {
                  setDisciplinaFiltro(value === 'todas' ? '' : value)
                  setPaginaAtual(1)
                }}
                disabled={loading}
              >
                <SelectTrigger className="pl-10 rounded-xl border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Filtrar por disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Disciplinas</SelectItem>
                  {disciplinas.map((disc) => (
                    <SelectItem key={disc.id} value={disc.id}>
                      {disc.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Carregando diários...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {planosPaginados.map((plano) => (
                <Card
                  key={plano.id}
                  className="hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-800"
                >
                  <CardContent className="flex flex-col items-center p-8 text-center space-y-6">
                    <div className="flex justify-between w-full">
                      <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-4 rounded-2xl shadow-lg">
                        <FaBookOpen className="text-4xl text-white" />
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="rounded-xl"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                excluirPlano(plano.id);
                              }}
                              disabled={loading}
                            >
                              <FaTrash className="text-red-500 hover:text-red-700" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir diário</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-2">
                        {plano.titulo}
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium">
                          {getDisciplinaNome(plano.disciplina_id)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                      </div>
                    </div>

                    <Link href={`/home/plano-aulas/${plano.id}`} className="w-full">
                      <Button className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3">
                        <FaBookOpen className="text-lg" />
                        <span>Acessar Diário</span>
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && planosFiltrados.length === 0 && (
            <div className="text-center py-16">
              <div className="flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-6">
                <FaBookOpen className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Nenhum diário encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || disciplinaFiltro 
                  ? "Tente ajustar os filtros de busca." 
                  : "Crie seu primeiro diário clicando no botão Novo Diário."}
              </p>
            </div>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <Button 
                disabled={paginaAtual === 1 || loading} 
                onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                className="rounded-xl"
                variant="outline"
              >
                Anterior
              </Button>
              {Array.from({ length: totalPaginas }, (_, i) => (
                <Button
                  key={i}
                  variant={paginaAtual === i + 1 ? 'default' : 'outline'}
                  onClick={() => setPaginaAtual(i + 1)}
                  disabled={loading}
                  className="rounded-xl"
                >
                  {i + 1}
                </Button>
              ))}
              <Button 
                disabled={paginaAtual === totalPaginas || loading} 
                onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                className="rounded-xl"
                variant="outline"
              >
                Próximo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}