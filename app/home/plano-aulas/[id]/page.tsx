'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { FaBook, FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaArrowLeft, FaFileAlt, FaUserGraduate, FaNotesMedical } from 'react-icons/fa'

type Registro = {
  id: string
  data: string
  conteudo: string
  observacoes: string
}

export default function RegistrosPlanoAula() {
  const [registros, setRegistros] = useState<Registro[]>([
    {
      id: '1',
      data: '2024-06-01',
      conteudo: 'Introdução à matemática básica - operações fundamentais',
      observacoes: 'Alunos demonstraram boa participação. Necessário reforçar conceitos de divisão.'
    },
    {
      id: '2', 
      data: '2024-06-03',
      conteudo: 'Geometria plana - figuras básicas e propriedades',
      observacoes: 'Atividade prática com formas geométricas foi bem recebida.'
    }
  ])
  const [loading, setLoading] = useState(false)
  const [modoEdicao, setModoEdicao] = useState<'adicionar' | 'editar' | null>(null)
  const [registroEditando, setRegistroEditando] = useState<Registro | null>(null)
  const [formData, setFormData] = useState({ data: '', conteudo: '', observacoes: '' })
  const [error, setError] = useState<string | null>(null)

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
    if (!formData.data || !formData.conteudo.trim()) {
      setError('Preencha os campos obrigatórios')
      return
    }
    
    setError(null)
    
    if (modoEdicao === 'adicionar') {
      const novoRegistro = {
        id: Date.now().toString(),
        data: formData.data,
        conteudo: formData.conteudo,
        observacoes: formData.observacoes
      }
      setRegistros([...registros, novoRegistro])
    } else if (modoEdicao === 'editar' && registroEditando) {
      setRegistros(registros.map(r => 
        r.id === registroEditando.id 
          ? { ...r, data: formData.data, conteudo: formData.conteudo, observacoes: formData.observacoes }
          : r
      ))
    }
    
    cancelarEdicao()
  }

  function handleExcluirRegistro(id: string) {
    if (confirm('Deseja realmente excluir este registro?')) {
      setRegistros(registros.filter(r => r.id !== id))
    }
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <FaBook className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Plano de Aula
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Gerencie e organize seus registros de aula
                </p>
              </div>
            </div>
            
            {/* Estatísticas Rápidas */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-2">
                  <FaFileAlt className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{registros.length} Registros</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-2">
                  <FaUserGraduate className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Turma</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mb-2">
                  <FaNotesMedical className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Progresso</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cabeçalho do Conteúdo */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
                  <FaCalendarAlt className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Registros de Aula
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                    Histórico completo das suas aulas e observações
                  </p>
                </div>
              </div>
              
              <Dialog open={modoEdicao === 'adicionar'} onOpenChange={(open) => !open && cancelarEdicao()}>
                <DialogTrigger asChild>
                  <Button
                    onClick={abrirAdicionar}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition-all duration-200 hover:shadow-xl"
                  >
                    <FaPlus className="mr-2" />
                    Novo Registro
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-2xl">
                  <DialogHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                        <FaPlus className="text-white text-xl" />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                          Adicionar Registro
                        </DialogTitle>
                        <DialogDescription className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                          Crie um novo registro de aula com conteúdo e observações
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Data da Aula
                        </label>
                        <input
                          type="date"
                          value={formData.data}
                          onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Conteúdo da Aula
                      </label>
                      <textarea
                        value={formData.conteudo}
                        onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                        rows={4}
                        placeholder="Descreva o conteúdo abordado na aula..."
                      />
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Observações
                      </label>
                      <textarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                        rows={3}
                        placeholder="Adicione observações sobre participação, dificuldades, etc..."
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 dark:bg-red-900 border-2 border-red-200 dark:border-red-700 rounded-xl p-4">
                        <p className="text-red-600 dark:text-red-400 font-semibold text-lg">{error}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-4 px-8 py-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <Button
                      onClick={cancelarEdicao}
                      className="px-6 py-3 text-lg font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all duration-200"
                    >
                      <FaTimes className="mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={salvar}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition-all duration-200 hover:shadow-xl"
                    >
                      <FaSave className="mr-2" />
                      Salvar Registro
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Lista de Registros */}
          <div className="p-8">
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-xl text-gray-600 dark:text-gray-300 mt-4">Carregando registros...</p>
              </div>
            )}

            {!loading && registros.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FaFileAlt className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Nenhum registro encontrado
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Comece criando seu primeiro registro de aula
                </p>
              </div>
            )}

            {!loading && registros.length > 0 && (
              <div className="grid grid-cols-1 gap-6">
                {registros.map((registro, index) => (
                  <Card
                    key={registro.id}
                    className="border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg bg-white dark:bg-gray-800"
                  >
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-md">
                              <FaCalendarAlt className="text-white text-lg" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Aula #{index + 1}
                              </h3>
                              <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold">
                                {formatarData(registro.data)}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                                Conteúdo:
                              </h4>
                              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                {registro.conteudo}
                              </p>
                            </div>

                            {registro.observacoes && (
                              <div className="bg-blue-50 dark:bg-blue-900 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                                  Observações:
                                </h4>
                                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                  {registro.observacoes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="ml-6 flex flex-col gap-3">
                          <Dialog open={modoEdicao === 'editar' && registroEditando?.id === registro.id} onOpenChange={(open) => !open && cancelarEdicao()}>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => abrirEditar(registro)}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl shadow-md font-semibold transition-all duration-200 hover:shadow-lg"
                              >
                                <FaEdit className="mr-2" />
                                Editar
                              </Button>
                            </DialogTrigger>
                            
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-2xl">
                              <DialogHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
                                <div className="flex items-center space-x-4">
                                  <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500">
                                    <FaEdit className="text-white text-xl" />
                                  </div>
                                  <div>
                                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                      Editar Registro
                                    </DialogTitle>
                                    <DialogDescription className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                                      Atualize as informações do registro de aula
                                    </DialogDescription>
                                  </div>
                                </div>
                              </DialogHeader>

                              <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                      Data da Aula
                                    </label>
                                    <input
                                      type="date"
                                      value={formData.data}
                                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    Conteúdo da Aula
                                  </label>
                                  <textarea
                                    value={formData.conteudo}
                                    onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                                    rows={4}
                                    placeholder="Descreva o conteúdo abordado na aula..."
                                  />
                                </div>

                                <div>
                                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    Observações
                                  </label>
                                  <textarea
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                                    rows={3}
                                    placeholder="Adicione observações sobre participação, dificuldades, etc..."
                                  />
                                </div>

                                {error && (
                                  <div className="bg-red-50 dark:bg-red-900 border-2 border-red-200 dark:border-red-700 rounded-xl p-4">
                                    <p className="text-red-600 dark:text-red-400 font-semibold text-lg">{error}</p>
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-end gap-4 px-8 py-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                <Button
                                  onClick={cancelarEdicao}
                                  className="px-6 py-3 text-lg font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all duration-200"
                                >
                                  <FaTimes className="mr-2" />
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={salvar}
                                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition-all duration-200 hover:shadow-xl"
                                >
                                  <FaSave className="mr-2" />
                                  Salvar Alterações
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            onClick={() => handleExcluirRegistro(registro.id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl shadow-md font-semibold transition-all duration-200 hover:shadow-lg"
                          >
                            <FaTrash className="mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botão Voltar */}
        <div className="mt-8 text-center">
          <Button className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-xl shadow-lg font-semibold text-lg transition-all duration-200 hover:shadow-xl">
            <FaArrowLeft className="mr-3" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Rodapé */}
      <div className="bg-white dark:bg-gray-800 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="text-lg">Sistema de Gestão Educacional</p>
            <p className="text-sm mt-2">Organize e acompanhe o progresso das suas aulas</p>
          </div>
        </div>
      </div>
    </div>
  )
}