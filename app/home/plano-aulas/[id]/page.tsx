'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaBookOpen,
  FaStickyNote,
  FaArrowLeft,
  FaClipboardList,
} from 'react-icons/fa'
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
  const [saving, setSaving] = useState(false)

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

  // Função para converter data local para ISO string sem timezone
  function formatDateForInput(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00'); // Força timezone local
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Função para formatar data para exibição mantendo timezone local
  function formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00'); // Força timezone local
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Função para formatar data curta para exibição
  function formatShortDateForDisplay(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00'); // Força timezone local
    return date.toLocaleDateString('pt-BR');
  }
  async function handleAdicionarRegistro() {
    if (!formData.data || !formData.conteudo.trim()) {
      setError('Preencha os campos obrigatórios')
      return
    }
    setError(null)
    setSaving(true)
    try {
      if (!planoId) throw new Error('ID não definido')

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
    } finally {
      setSaving(false)
    }
  }

  async function handleEditarRegistro() {
    if (!formData.data || !formData.conteudo.trim()) {
      setError('Preencha os campos obrigatórios')
      return
    }
    setError(null)
    setSaving(true)
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
    } finally {
      setSaving(false)
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
      data: formatDateForInput(registro.data), // Use a função utilitária
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
                <FaClipboardList className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Registros de Aulas
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                  Gerencie os registros das suas aulas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Dialog open={modoEdicao !== null} onOpenChange={(open) => !open && cancelarEdicao()}>
                <DialogTrigger asChild>
                  <Button
                    onClick={abrirAdicionar}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 text-lg font-semibold"
                  >
                    <FaPlus />
                    Novo Registro
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-2xl rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-2xl bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                  <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                        {modoEdicao === 'adicionar' ? <FaPlus className="text-white text-xl" /> : <FaEdit className="text-white text-xl" />}
                      </div>
                      <DialogTitle className="text-xl font-bold">
                        {modoEdicao === 'adicionar' ? 'Adicionar Registro' : 'Editar Registro'}
                      </DialogTitle>
                    </div>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="data" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-500" />
                        Data da Aula
                      </Label>
                      <Input
                        id="data"
                        type="date"
                        value={formData.data}
                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                        className="rounded-lg border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="conteudo" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                        <FaBookOpen className="text-green-500" />
                        Conteúdo da Aula
                      </Label>
                      <textarea
                        id="conteudo"
                        value={formData.conteudo}
                        onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                        rows={4}
                        placeholder="Descreva o conteúdo abordado na aula..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observacoes" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                        <FaStickyNote className="text-yellow-500" />
                        Observações
                      </Label>
                      <textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                        rows={3}
                        placeholder="Adicione observações, dificuldades encontradas, etc..."
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Button
                      variant="outline"
                      onClick={cancelarEdicao}
                      className="rounded-lg"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={salvar}
                      disabled={saving || !formData.data || !formData.conteudo.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Salvando...</span>
                        </>
                      ) : (
                        <>
                          {modoEdicao === 'adicionar' ? <FaPlus /> : <FaEdit />}
                          <span>{modoEdicao === 'adicionar' ? 'Adicionar' : 'Salvar'}</span>
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                onClick={() => router.back()}
                variant="outline"
                className="px-6 py-3 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 font-semibold"
              >
                <FaArrowLeft />
                Voltar
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Carregando registros...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {registros.map((registro) => (
                <Card
                  key={registro.id}
                  className="hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-800"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                            <FaCalendarAlt className="text-white text-lg" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {formatDateForDisplay(registro.data)}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              {formatShortDateForDisplay(registro.data)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <FaBookOpen className="text-green-500 text-lg mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Conteúdo:</p>
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{registro.conteudo}</p>
                            </div>
                          </div>

                          {registro.observacoes && (
                            <div className="flex items-start gap-3">
                              <FaStickyNote className="text-yellow-500 text-lg mt-1 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Observações:</p>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{registro.observacoes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-6">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => abrirEditar(registro)}
                                className="rounded-xl hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 transition-all duration-200"
                              >
                                <FaEdit className="text-blue-500 hover:text-blue-700" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar registro</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleExcluirRegistro(registro.id)}
                                className="rounded-xl hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20 transition-all duration-200"
                              >
                                <FaTrash className="text-red-500 hover:text-red-700" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir registro</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && registros.length === 0 && (
            <div className="text-center py-16">
              <div className="flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-6">
                <FaClipboardList className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Nenhum registro encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Adicione registros clicando no botão Novo Registro.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}