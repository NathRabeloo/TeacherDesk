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

const disciplinaColors: Record<string, string> = {
  matematica: 'bg-blue-500',
  portugues: 'bg-pink-400',
  historia: 'bg-yellow-500',
  geografia: 'bg-green-600',
  ciencias: 'bg-purple-500',
  outra: 'bg-gray-500',
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
    const matchSearch = plano.titulo
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchDisciplina = disciplinaFiltro
      ? plano.disciplina_id === disciplinaFiltro
      : true
    return matchSearch && matchDisciplina
  })

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

    const { success, data } = await criarPlanoAula(formData)

    if (success && data.length > 0) {
      const novoPlano = data[0]
      setPlanos([...planos, novoPlano])
      setModalAberto(false)
      setNovoTitulo('')
      setNovaDisciplinaId(null)
      router.push(`/plano-aulas/${novoPlano.id}`)
    } else {
      alert('Erro ao criar plano')
    }
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen dark:bg-dark-primary">
      <h1 className="text-2xl font-bold mb-4">Planos de Aula</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <Input
          placeholder="Buscar planos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-1/2"
        />
        <Select onValueChange={setDisciplinaFiltro}>
          <SelectTrigger className="w-full md:w-1/4">
            <SelectValue placeholder="Filtrar por disciplina" />
          </SelectTrigger>
          <SelectContent>
            {disciplinas.map((disc) => (
              <SelectItem key={disc.id} value={disc.id}>
                {disc.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setModalAberto(true)}>Adicionar Plano</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {planosFiltrados.map((plano) => (
          <Card key={plano.id} className="flex items-center justify-center h-40">
            <CardContent className="p-4 w-full h-full bg-white dark:bg-dark-card rounded-lg shadow">
              <div className="space-y-2 text-center">
                <h2 className="text-md font-semibold line-clamp-2">{plano.titulo}</h2>
                <div
                  className={`rounded-full text-white text-sm font-semibold px-3 py-1 ${
                    disciplinaColors[getDisciplinaNome(plano.disciplina_id).toLowerCase()] || 'bg-gray-500'
                  }`}
                >
                  {getDisciplinaNome(plano.disciplina_id)}
                </div>
              </div>
              <Link href={`/plano-aulas/${plano.id}`}>
                <Button variant="outline" className="w-full mt-2">Acessar Diário</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Plano</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Título"
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
            />
            <Select onValueChange={setNovaDisciplinaId}>
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
  )
}

