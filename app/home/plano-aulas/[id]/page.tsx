'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  listarRegistrosPorPlanoId,
  inserirRegistroAula,
  editarRegistroAula,
  deletarRegistroAula,
} from '@/app/actions'

type Registro = {
  id: string
  data: string
  conteudo: string
  observacoes: string
}

export default function RegistrosPlanoAula() {
  const params = useParams()
  const router = useRouter()
  const planoIdRaw = params.id
  const planoId = Array.isArray(planoIdRaw) ? planoIdRaw[0] : planoIdRaw

  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)

  const [modoEdicao, setModoEdicao] = useState<'adicionar' | 'editar' | null>(null)
  const [registroEditando, setRegistroEditando] = useState<Registro | null>(null)
  const [formData, setFormData] = useState({ data: '', conteudo: '', observacoes: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const carregarRegistros = async () => {
      setLoading(true)
      try {
        if (planoId) {
          const result = await listarRegistrosPorPlanoId(planoId)
          if (result && 'data' in result && Array.isArray(result.data)) {
            setRegistros(result.data)
          } else {
            setRegistros([])
            console.error('Estrutura inesperada:', result)
          }
        }
      } catch (error) {
        setRegistros([])
        console.error('Erro ao carregar registros:', error)
      } finally {
        setLoading(false)
      }
    }

    if (planoId) {
      carregarRegistros()
    }
  }, [planoId])

  async function handleAdicionarRegistro() {
    if (!formData.data || !formData.conteudo.trim()) {
      setError('Preencha os campos obrigatórios')
      return
    }
    setError(null)
    try {
      if (!planoId) throw new Error('Plano ID não definido')

      await inserirRegistroAula(planoId, {
        data: formData.data,
        conteudo: formData.conteudo,
        observacoes: formData.observacoes,
      })

      const resultadoAtualizado = await listarRegistrosPorPlanoId(planoId)
      setRegistros(Array.isArray(resultadoAtualizado.data) ? resultadoAtualizado.data : [])
      cancelarEdicao()
    } catch (e) {
      setError('Erro ao adicionar registro')
      console.error(e)
    }
  }

  async function handleEditarRegistro() {
    if (!formData.data || !formData.conteudo.trim()) {
      setError('Preencha os campos obrigatórios')
      return
    }
    setError(null)
    try {
      if (!registroEditando) throw new Error('Registro para editar não definido')

      await editarRegistroAula(registroEditando.id, {
        data: formData.data,
        conteudo: formData.conteudo,
        observacoes: formData.observacoes,
      })

      if (planoId) {
        const resultadoAtualizado = await listarRegistrosPorPlanoId(planoId)
        setRegistros(Array.isArray(resultadoAtualizado.data) ? resultadoAtualizado.data : [])
      }

      cancelarEdicao()
    } catch (e) {
      setError('Erro ao editar registro')
      console.error(e)
    }
  }

  async function handleExcluirRegistro(id: string) {
    if (!confirm('Deseja realmente excluir este registro?')) return

    try {
      await deletarRegistroAula(id)

      if (planoId) {
        const resultadoAtualizado = await listarRegistrosPorPlanoId(planoId)
        setRegistros(Array.isArray(resultadoAtualizado.data) ? resultadoAtualizado.data : [])
      }
    } catch (e) {
      alert('Erro ao excluir registro')
      console.error(e)
    }
  }

  function abrirAdicionar() {
    setModoEdicao('adicionar')
    setRegistroEditando(null)
    setFormData({ data: '', conteudo: '', observacoes: '' })
    setError(null)
  }

  function abrirEditar(registro: Registro) {
    setModoEdicao('editar')
    setRegistroEditando(registro)
    setFormData({
      data: new Date(registro.data).toISOString().substring(0, 10),
      conteudo: registro.conteudo,
      observacoes: registro.observacoes || '',
    })
    setError(null)
  }

  function cancelarEdicao() {
    setModoEdicao(null)
    setRegistroEditando(null)
    setFormData({ data: '', conteudo: '', observacoes: '' })
    setError(null)
  }

  async function salvar() {
    if (modoEdicao === 'adicionar') {
      await handleAdicionarRegistro()
    } else if (modoEdicao === 'editar') {
      await handleEditarRegistro()
    }
  }

  return (
   <div className="min-h-screen bg-white dark:bg-[var(--background)] text-black dark:text-[var(--foreground)] flex justify-center items-start py-10">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-md w-full max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-zinc-900 dark:text-white">
          Registros do Plano
        </h1>

        {loading && <p className="text-center">Carregando registros...</p>}

        {!loading && registros.length === 0 && (
          <p className="text-center text-center text-zinc-900 dark:text-white">Nenhum registro encontrado.</p>
        )}

        <div className="space-y-4">
          {registros.map((registro) => (
            <Card key={registro.id} className="bg-white dark:bg-zinc-800 border dark:border-zinc-700">
              <CardContent className="text-zinc-800 dark:text-white">
                <div className="space-y-2 py-5">
                  <p className="font-bold text-md">
                    Aula do dia: {new Date(registro.data).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Conteúdo:</strong> {registro.conteudo}
                  </p>
                  <p>
                    <strong>Observações:</strong> {registro.observacoes}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => abrirEditar(registro)}
                      className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110"
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleExcluirRegistro(registro.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          ))}
        </div>

        {(modoEdicao === 'adicionar' || modoEdicao === 'editar') && (
          <div className="mt-6 border p-4 rounded-md bg-gray-50 dark:bg-zinc-800">
            <h2 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-white">
              {modoEdicao === 'adicionar' ? 'Adicionar Registro' : 'Editar Registro'}
            </h2>

            <label className="block mb-2 text-zinc-800 dark:text-white">
              Data:
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className="ml-2 border rounded px-2 py-1 bg-white dark:bg-zinc-700 dark:text-white"
              />
            </label>

            <label className="block mb-2 text-zinc-800 dark:text-white">
              Conteúdo:
              <textarea
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                className="block w-full border rounded px-2 py-1 mt-1 bg-white dark:bg-zinc-700 dark:text-white"
                rows={3}
              />
            </label>

            <label className="block mb-2 text-zinc-800 dark:text-white">
              Observações:
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="block w-full border rounded px-2 py-1 mt-1 bg-white dark:bg-zinc-700 dark:text-white"
                rows={2}
              />
            </label>

            {error && <p className="text-red-600 mb-2">{error}</p>}

            <div className="flex gap-2">
              <Button
                onClick={salvar}
                className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110"
              >
                {modoEdicao === 'adicionar' ? 'Adicionar' : 'Salvar'}
              </Button>
              <Button
                onClick={cancelarEdicao}
                className="bg-gray-200 dark:bg-gray-600 text-black dark:text-white hover:brightness-110"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {modoEdicao === null && (
          <div className="mt-6 text-center">
            <Button
              onClick={abrirAdicionar}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110"
            >
              Adicionar Registro
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Button
            onClick={() => router.back()}
            className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 mt-4"
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  )
}



