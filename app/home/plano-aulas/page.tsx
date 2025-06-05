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
  DialogDescription,
} from '@/components/ui/dialog'
import {
  listarDisciplinas,
  listarPlanosAula,
  criarPlanoAula,
  deletarPlanoAula,
} from '@/app/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaBook, FaPlus, FaSearch, FaFilter, FaBookOpen, FaCalendarAlt, FaGraduationCap } from 'react-icons/fa'

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
          {/* Cabeçalho do Conteúdo */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
                  <FaBook className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Seus Diários
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                    Acesse e organize seus planos de aula
                  </p>
                </div>
              
              <Button
                onClick={() => {
                  setNovoTitulo('')
                  setNovaDisciplinaId(null)
                  setModalAberto(true)
                }}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <FaPlus className="mr-2" />
                Novo Diário
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-600">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar planos de aula..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPaginaAtual(1)
                  }}
                  className="pl-10 h-12 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  disabled={loading}
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <FaFilter className="text-gray-500" />
                <Select
                  value={disciplinaFiltro || 'todas'}
                  onValueChange={(value) => {
                    setDisciplinaFiltro(value === 'todas' ? '' : value)
                    setPaginaAtual(1)
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="w-64 h-12 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl">
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

          {/* Grid de Diários */}
          <div className="p-8">
            {planosPaginados.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <FaBookOpen className="text-gray-400 text-4xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Nenhum diário encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Comece criando seu primeiro plano de aula
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {planosPaginados.map((plano) => (
                  <Card
                    key={plano.id}
                    className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-800"
                  >
                    <CardContent className="flex flex-col p-6 text-centers space-y-4 h-full">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg w-fit mx-auto">
                        <FaBookOpen className="text-3xl text-white" />
                      </div>
                      
                      <div className="space-y-3 flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 text-center">
                          {plano.titulo}
                        </h3>
                        <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-full text-center">
                          {getDisciplinaNome(plano.disciplina_id)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 mt-auto">
                        <Link href={`/home/plano-aulas/${plano.id}`} className="w-full">
                          <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                            Acessar Diário
                          </Button>
                        </Link>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            excluirPlano(plano.id)
                          }}
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                          disabled={loading}
                        >
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-center items-center gap-3">
                <Button
                  disabled={paginaAtual === 1 || loading}
                  onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 px-6 py-2 rounded-xl"
                >
                  Anterior
                </Button>

                {Array.from({ length: totalPaginas }, (_, i) => (
                  <Button
                    key={i}
                    onClick={() => setPaginaAtual(i + 1)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                      paginaAtual === i + 1
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  disabled={paginaAtual === totalPaginas || loading}
                  onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 px-6 py-2 rounded-xl"
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Adicionar Diário */}
      <Dialog open={modalAberto} onOpenChange={(open) => { if (!loading) setModalAberto(open) }}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-2xl rounded-2xl">
          <DialogHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 -m-6 mb-6 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
                <FaPlus className="text-white text-xl" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Novo Diário
                </DialogTitle>
                <DialogDescription className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Crie um novo plano de aula
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 px-2">
            <div>
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Título do Diário
              </label>
              <Input
                placeholder="Digite o título do plano de aula..."
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
                disabled={loading}
                className="h-12 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
            
            <div>
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Disciplina
              </label>
              <Select
                value={novaDisciplinaId || ''}
                onValueChange={(value) => setNovaDisciplinaId(value || null)}
                disabled={loading}
              >
                <SelectTrigger className="h-12 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl">
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

          <DialogFooter className="flex gap-3 mt-8">
            <Button
              onClick={() => setModalAberto(false)}
              disabled={loading}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 py-3 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={salvarPlano}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? 'Salvando...' : 'Criar Diário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}