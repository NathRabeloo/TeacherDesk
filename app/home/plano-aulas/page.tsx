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
  const [loading, setLoading] = useState(false) // Para controlar loading

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
      formData.append('cor', 'bg-orange-300') // Mantido conforme backend

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
    <div className="min-h-screen bg-blue-100 flex justify-center items-start py-10">
      <div className="bg-white rounded-3xl shadow-md w-full max-w-[90rem] p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Diários de Aula</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-center">
          <Input
            placeholder="Buscar planos..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPaginaAtual(1)
            }}
            className="md:w-1/2"
            disabled={loading}
          />
          <Select
            value={disciplinaFiltro || 'todas'}
            onValueChange={(value) => {
              setDisciplinaFiltro(value === 'todas' ? '' : value)
              setPaginaAtual(1)
            }}
            disabled={loading}
          >
            <SelectTrigger className="w-full md:w-1/4">
              <SelectValue placeholder="Filtrar por disciplina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {disciplinas.map((disc) => (
                <SelectItem key={disc.id} value={disc.id}>
                  {disc.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setNovoTitulo('')
              setNovaDisciplinaId(null)
              setModalAberto(true)
            }}
            disabled={loading}
          >
            Adicionar Diário
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {planosPaginados.map((plano) => (
            <Card key={plano.id} className="h-full">
              <CardContent className="p-4 bg-white rounded-lg shadow h-full flex flex-col justify-between">
                <div className="space-y-1 text-center">
                  <h2 className="text-md font-semibold line-clamp-2">{plano.titulo}</h2>
                  <div className="rounded-full text-white text-sm font-semibold px-3 py-1 bg-orange-400">
                    {getDisciplinaNome(plano.disciplina_id)}
                  </div>
                </div>
                <div className="mt-4 flex justify-between gap-2">
                  <Link href={`/home/plano-aulas/${plano.id}`} className="flex-1">
                    <Button className="w-full bg-blue-400 text-white hover:bg-blue-500">
                      Acessar Diário
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => excluirPlano(plano.id)}
                    className="flex-1"
                    disabled={loading}
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Paginação */}
        <div className="flex justify-center gap-2 mb-10">
          <Button disabled={paginaAtual === 1 || loading} onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}>
            Anterior
          </Button>
          {[...Array(totalPaginas).keys()].map((i) => (
            <Button
              key={i}
              variant={paginaAtual === i + 1 ? 'default' : 'outline'}
              onClick={() => setPaginaAtual(i + 1)}
              disabled={loading}
            >
              {i + 1}
            </Button>
          ))}
          <Button disabled={paginaAtual === totalPaginas || loading} onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}>
            Próximo
          </Button>
        </div>

        {/* Modal */}
        <Dialog open={modalAberto} onOpenChange={(open) => {
          if (!loading) setModalAberto(open)
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Diário</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Título"
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
                disabled={loading}
              />
              <Select
                value={novaDisciplinaId || ''}
                onValueChange={(value) => setNovaDisciplinaId(value || null)}
                disabled={loading}
              >
                <SelectTrigger>
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
            <DialogFooter>
              <Button
                type="submit"
                onClick={salvarPlano}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
