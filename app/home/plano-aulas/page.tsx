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
} from '@/app/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Plano = {
  id: string
  titulo: string
  disciplina_id: string
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

  useEffect(() => {
    const carregar = async () => {
      const [disciplinasDB, planosDB] = await Promise.all([
        listarDisciplinas(),
        listarPlanosAula(),
      ])
      setDisciplinas(disciplinasDB)
      setPlanos(planosDB)
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

  const adicionarPlano = async () => {
    if (!novoTitulo || !novaDisciplinaId) {
      alert('Preencha o título e a disciplina.')
      return
    }

    const formData = new FormData()
    formData.append('titulo', novoTitulo)
    formData.append('disciplina_id', novaDisciplinaId)
    formData.append('cor', 'bg-orange-300') // cor fixa laranja claro

    const { success, data } = await criarPlanoAula(formData)

    if (success && data && data.length > 0) {
      const novoPlano = data[0]
      setPlanos((prev) => [novoPlano, ...prev]) // Adiciona no topo
      setModalAberto(false)
      setNovoTitulo('')
      setNovaDisciplinaId(null)
      setPaginaAtual(1)
      router.push(`/plano-aulas/${novoPlano.id}`)
    } else {
      alert('Erro ao criar plano')
    }
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
          />
         <Select
  value={disciplinaFiltro || 'todas'}
  onValueChange={(value) => {
    setDisciplinaFiltro(value === 'todas' ? '' : value)
    setPaginaAtual(1)
  }}
>
  <SelectTrigger className="w-full md:w-1/4">
    <SelectValue placeholder="Filtrar por disciplina" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="todas">Todas</SelectItem>  {/* não pode ser "" */}
    {disciplinas.map((disc) => (
      <SelectItem key={disc.id} value={disc.id}>
        {disc.nome}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
          <Button onClick={() => setModalAberto(true)}>Adicionar Diário</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {planosPaginados.map((plano) => (
            <Card key={plano.id} className="h-full">
              <CardContent className="p-4 bg-white rounded-lg shadow h-full flex flex-col justify-between">
                <div className="space-y-2 text-center">
                  <h2 className="text-md font-semibold line-clamp-2">{plano.titulo}</h2>
                  <div className="rounded-full text-white text-sm font-semibold px-3 py-1 bg-orange-400">
                    {getDisciplinaNome(plano.disciplina_id)}
                  </div>
                </div>
                <Link href={`/home/plano-aulas/${plano.id}`}>
                  <Button className="w-full mt-4 bg-blue-400 text-white hover:bg-blue-500">
                    Acessar Diário
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4">
          <Button
            onClick={() => setPaginaAtual((prev) => Math.max(1, prev - 1))}
            disabled={paginaAtual === 1}
            variant="outline"
          >
            Anterior
          </Button>
          <span className="font-semibold">
            Página {paginaAtual} de {totalPaginas}
          </span>
          <Button
            onClick={() => setPaginaAtual((prev) => Math.min(totalPaginas, prev + 1))}
            disabled={paginaAtual === totalPaginas}
            variant="outline"
          >
            Próxima
          </Button>
        </div>

        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Diário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Título"
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
              />
              <Select
                value={novaDisciplinaId ?? ''}
                onValueChange={setNovaDisciplinaId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Disciplina" />
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
              <Button onClick={adicionarPlano}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
