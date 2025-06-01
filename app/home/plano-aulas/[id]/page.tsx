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
    <div className="min-h-screen bg-blue-100 flex justify-center items-start py-10">
      <div className="bg-white rounded-3xl shadow-md w-full max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Registros do Plano</h1>

        {loading && <p>Carregando registros...</p>}

        {!loading && registros.length === 0 && <p>Nenhum registro encontrado.</p>}

        <div className="space-y-4">
          {registros.map((registro) => (
            <Card key={registro.id}>
              <CardContent>
                <div className="space-y-2 py-5">
                <p className="font-bold text-md">Aula do dia: {new Date(registro.data).toLocaleDateString()}</p>
                <p><strong>Conteúdo:</strong> {registro.conteudo}</p>
                <p><strong>Observações:</strong> {registro.observacoes}</p>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => abrirEditar(registro)}>
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
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
          <div className="mt-6 border p-4 rounded-md bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">
              {modoEdicao === 'adicionar' ? 'Adicionar Registro' : 'Editar Registro'}
            </h2>

            <label className="block mb-2">
              Data:
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className="ml-2 border rounded px-2 py-1"
              />
            </label>

            <label className="block mb-2">
              Conteúdo:
              <textarea
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                className="block w-full border rounded px-2 py-1 mt-1"
                rows={3}
              />
            </label>

            <label className="block mb-2">
              Observações:
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="block w-full border rounded px-2 py-1 mt-1"
                rows={2}
              />
            </label>

            {error && <p className="text-red-600 mb-2">{error}</p>}

            <div className="flex gap-2">
              <Button onClick={salvar}>
                {modoEdicao === 'adicionar' ? 'Adicionar' : 'Salvar'}
              </Button>
              <Button variant="outline" onClick={cancelarEdicao}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {modoEdicao === null && (
          <div className="mt-6 text-center">
            <Button onClick={abrirAdicionar}>Adicionar Registro</Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Button onClick={() => router.back()}>Voltar</Button>
        </div>
      </div>
    </div>
  )
}


