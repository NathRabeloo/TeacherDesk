"use client";

import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaQrcode, FaChartBar, FaSearch, FaFilter, FaPlus, FaQuestionCircle, } from "react-icons/fa";
import QRCode from "react-qr-code";
import { Copy } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import {  FaInfoCircle } from "react-icons/fa";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { criarSessaoQuiz, listarSessoesQuiz, obterLinkQuizSession, excluirSessaoQuiz } from "../action";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Quiz {
  id: string;
  titulo: string;
  disciplina_id: string;
}

interface Disciplina {
  id: string;
  nome: string;
}

interface QuizSession {
  id: string;
  nome: string;
  data: string;
  participantes: number;
}

interface QuizListProps {
  onCreateQuiz: () => void;
  onEditQuiz: (quizId: string) => void;
  onViewResults?: (quizId: string, sessionId?: string) => void;
}

const QuizList: React.FC<QuizListProps> = ({ onCreateQuiz, onEditQuiz, onViewResults }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [sessoes, setSessoes] = useState<QuizSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Novos estados para QR Code de sessão
  const [isSessionQRCodeOpen, setIsSessionQRCodeOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<QuizSession | null>(null);
  const [sessionQRCodeUrl, setSessionQRCodeUrl] = useState("");
  const [sessionCopied, setSessionCopied] = useState(false);

  useEffect(() => {
    const fetchDisciplinas = async () => {
      try {
        const res = await fetch("/api/disciplinas");
        if (!res.ok) throw new Error("Erro ao buscar disciplinas");
        const data = await res.json();
        setDisciplinas(data);
      } catch (error) {
        console.error("Erro ao buscar disciplinas:", error);
      }
    };
    fetchDisciplinas();
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const query = selectedDisciplina
          ? `/api/quizzes?disciplinaId=${selectedDisciplina}`
          : `/api/quizzes`;
        const res = await fetch(query);
        if (!res.ok) throw new Error("Falha ao buscar quizzes");
        const data = await res.json();
        setQuizzes(data);
      } catch (error) {
        console.error("Erro ao buscar quizzes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizzes();
  }, [selectedDisciplina]);

  const handleDelete = async (quizId: string) => {
    if (!confirm("Tem certeza que deseja excluir este quiz?")) return;
    try {
      const res = await fetch(`/api/quizzes?id=${quizId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir quiz");
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
    } catch (error) {
      console.error("Erro ao excluir quiz:", error);
      alert("Erro ao excluir quiz");
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.titulo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const qrCodeUrl = selectedQuiz
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/responder?id=${selectedQuiz.id}`
    : "";

  const handleCopy = () => {
    if (!qrCodeUrl) return;
    navigator.clipboard.writeText(qrCodeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQRCodeDialogChange = (open: boolean) => {
    setIsQRCodeOpen(open);
    if (!open) {
      setSelectedQuiz(null);
      setCopied(false);
    }
  };

  // Reintroduzindo e adaptando handleOpenSessionDialog
  const handleOpenSessionDialog = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsSessionDialogOpen(true);
    setIsLoadingSessions(true);
    try {
      const sessoes = await listarSessoesQuiz(quiz.id);
      setSessoes(sessoes);
    } catch (error) {
      console.error("Erro ao listar sessões:", error);
      alert("Erro ao carregar sessões do quiz");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Reintroduzindo handleSessionDialogChange
  const handleSessionDialogChange = (open: boolean) => {
    setIsSessionDialogOpen(open);
    if (!open) {
      setSelectedQuiz(null);
      setSessoes([]);
      setNewSessionName("");
    }
  };

  // Reintroduzindo e adaptando handleCreateSession
  const handleCreateSession = async () => {
    if (!selectedQuiz) return;

    setIsCreatingSession(true);
    try {
      const sessaoNome = newSessionName.trim() || `Turma ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`;
      const novaSessao = await criarSessaoQuiz(selectedQuiz.id, sessaoNome);

      // Atualizar a lista de sessões
      const sessoes = await listarSessoesQuiz(selectedQuiz.id);
      setSessoes(sessoes);
      setNewSessionName("");

      // Após criar, abrir o QR Code da nova sessão
      handleGenerateSessionQRCode({
        id: novaSessao.id,
        nome: novaSessao.nome_sessao || sessaoNome,
        data: new Date(novaSessao.created_at).toLocaleDateString(),
        participantes: 0 // Nova sessão, 0 participantes
      });

    } catch (error) {
      console.error("Erro ao criar turma:", error);
      alert("Erro ao criar nova turma de quiz");
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleGetSessionLink = async (sessionId: string) => {
    try {
      const linkInfo = await obterLinkQuizSession(sessionId);
      // Copiar o link para a área de transferência
      navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : ""}${linkInfo.link}`);
      alert("Link copiado para a área de transferência!");
    } catch (error) {
      console.error("Erro ao obter link da Turma:", error);
      alert("Erro ao gerar link da turma");
    }
  };

  // Nova função para excluir sessão
  const handleDeleteSession = async (sessionId: string, sessionName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a turma "${sessionName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await excluirSessaoQuiz(sessionId);

      // Atualizar a lista de sessões após exclusão
      if (selectedQuiz) {
        const sessoesAtualizadas = await listarSessoesQuiz(selectedQuiz.id);
        setSessoes(sessoesAtualizadas);
      }

      alert("Turma excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir Turma:", error);
      alert("Erro ao excluir Turma. Tente novamente.");
    }
  };

  // Nova função para gerar QR Code da sessão
  const handleGenerateSessionQRCode = async (session: QuizSession) => {
    try {
      const linkInfo = await obterLinkQuizSession(session.id);
      const fullUrl = `${typeof window !== "undefined" ? window.location.origin : ""}${linkInfo.link}`;

      setSelectedSession(session);
      setSessionQRCodeUrl(fullUrl);
      setIsSessionQRCodeOpen(true);
    } catch (error) {
      console.error("Erro ao gerar QR Code da Turma:", error);
      alert("Erro ao gerar QR Code da Turma");
    }
  };

  // Função para copiar link da sessão (QR Code)
  const handleCopySessionLink = () => {
    if (!sessionQRCodeUrl) return;
    navigator.clipboard.writeText(sessionQRCodeUrl);
    setSessionCopied(true);
    setTimeout(() => setSessionCopied(false), 2000);
  };

  // Função para fechar dialog do QR Code da sessão
  const handleSessionQRCodeDialogChange = (open: boolean) => {
    setIsSessionQRCodeOpen(open);
    if (!open) {
      setSelectedSession(null);
      setSessionQRCodeUrl("");
      setSessionCopied(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Área de Filtros e Pesquisa */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-blue-500 p-2 rounded-lg">
              <FaSearch className="text-white text-lg" />
            </div>
            <Input
              placeholder="Buscar quiz por título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <FaFilter className="text-white text-lg" />
            </div>
            <Select
              onValueChange={(value) => setSelectedDisciplina(value === "all" ? null : value)}
              value={selectedDisciplina ?? "all"}
            >
              <SelectTrigger className="w-[240px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl shadow-sm">
                <SelectValue placeholder="Filtrar por Disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Disciplinas</SelectItem>
                {disciplinas.map((disciplina) => (
                  <SelectItem key={disciplina.id} value={disciplina.id}>
                    {disciplina.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={onCreateQuiz}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
          >
            <FaPlus className="text-lg" />
            Novo quiz
          </Button>
        </div>
      </div>

      {/* Área de Conteúdo Principal */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300">Carregando quizs...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <FaQuestionCircle className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Nenhum quiz encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              {searchQuery || selectedDisciplina
                ? "Tente ajustar os filtros de pesquisa"
                : "Comece criando seu primeiro quiz"}
            </p>
            <Button
              onClick={onCreateQuiz}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
            >
              <FaPlus className="text-xl" />
              Criar Primeiro quiz
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                  <TableHead className="text-left py-4 px-6 font-bold text-gray-900 dark:text-white text-lg">
                    Título do quiz
                  </TableHead>
                  <TableHead className="text-left py-4 px-6 font-bold text-gray-900 dark:text-white text-lg">
                    Disciplina
                  </TableHead>
                  <TableHead className="text-center py-4 px-6 font-bold text-gray-900 dark:text-white text-lg">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuizzes.map((quiz, index) => (
                  <TableRow
                    key={quiz.id}
                    className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}
                      }`}
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                          <FaQuestionCircle className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-lg">
                            {quiz.titulo}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-lg font-medium">
                        {disciplinas.find((d) => d.id === quiz.disciplina_id)?.nome ?? "N/A"}
                      </span>
                    </TableCell>

                    <TableCell className="py-4 px-6">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => onEditQuiz(quiz.id)}
                          title="Editar quiz"
                          className="h-10 w-10 rounded-xl border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:border-blue-600 dark:hover:bg-blue-900 transition-all duration-200"
                        >
                          <FaEdit className="text-blue-600 dark:text-blue-400" />
                        </Button>

                        {onViewResults && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => onViewResults(quiz.id)}
                            title="Ver Resultados"
                            className="h-10 w-10 rounded-xl border-2 border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-700 dark:hover:border-green-600 dark:hover:bg-green-900 transition-all duration-200"
                          >
                            <FaChartBar className="text-green-600 dark:text-green-400" />
                          </Button>
                        )}

                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleOpenSessionDialog(quiz)} // Alterado para abrir o modal de gerenciamento
                          title="Gerenciar Turma / Gerar QR Code"
                          className="h-10 w-10 rounded-xl border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:border-orange-600 dark:hover:bg-orange-900 transition-all duration-200"
                        >
                          <FaQrcode className="text-orange-600 dark:text-orange-400" />
                        </Button>

                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDelete(quiz.id)}
                          title="Excluir quiz"
                          className="h-10 w-10 rounded-xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:border-red-600 dark:hover:bg-red-900 transition-all duration-200"
                        >
                          <FaTrash className="text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Diálogo de Gerenciamento de Sessões (reintroduzido e adaptado) */}
      <Dialog open={isSessionDialogOpen} onOpenChange={handleSessionDialogChange}>
        <DialogContent className="sm:max-w-[600px] p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
              Gerenciar Turma do Quiz: {selectedQuiz?.titulo}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
              <Input
                placeholder="Nome da nova turma (opcional)"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                className="flex-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-xl shadow-sm"
              />
              <Button
                onClick={handleCreateSession}
                disabled={isCreatingSession}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isCreatingSession ? "Criando..." : "Criar Nova Turma"}
              </Button>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Turmas Existentes:</h3>
            {isLoadingSessions ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-gray-600 dark:text-gray-300">Carregando turmas...</p>
              </div>
            ) : sessoes.length === 0 ? (
              <div className="text-center py-4 text-gray-600 dark:text-gray-300">
                Nenhuma Turma criada para este quiz ainda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                      <TableHead className="text-gray-700 dark:text-gray-200">Nome da Turma</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-200">Data de Criação</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-200">Participantes</TableHead>
                      <TableHead className="text-right text-gray-700 dark:text-gray-200">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessoes.map((sessao) => (
                      <TableRow key={sessao.id} className="border-b border-gray-100 dark:border-gray-700">
                        <TableCell className="font-medium text-gray-900 dark:text-white">{sessao.nome}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{sessao.data}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{sessao.participantes}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleGenerateSessionQRCode(sessao)}
                              title="Gerar QR Code"
                              className="h-9 w-9 rounded-xl border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:border-orange-600 dark:hover:bg-orange-900 transition-all duration-200"
                            >
                              <FaQrcode className="text-orange-600 dark:text-orange-400" />
                            </Button>
                            {onViewResults && (
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => onViewResults(selectedQuiz!.id, sessao.id)}
                                title="Ver Resultados da Turma"
                                className="h-9 w-9 rounded-xl border-2 border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-700 dark:hover:border-green-600 dark:hover:bg-green-900 transition-all duration-200"
                              >
                                <FaChartBar className="text-green-600 dark:text-green-400" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleDeleteSession(sessao.id, sessao.nome)}
                              title="Excluir Turma"
                              className="h-9 w-9 rounded-xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:border-red-600 dark:hover:bg-red-900 transition-all duration-200"
                            >
                              <FaTrash className="text-red-600 dark:text-red-400" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => handleSessionDialogChange(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-xl shadow-sm"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de QR Code da Sessão (simplificado) */}
      <Dialog open={isSessionQRCodeOpen} onOpenChange={handleSessionQRCodeDialogChange}>
        <DialogContent className="sm:max-w-[425px] p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              QR Code da Turma
            </DialogTitle>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
              Compartilhe este QR Code ou link para os participantes acessarem o quiz.
            </p>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl mb-4">
            {sessionQRCodeUrl ? (
              <QRCode value={sessionQRCodeUrl} size={200} level="H" />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Gerando QR Code...</p>
            )}
          </div>
          {sessionQRCodeUrl && (
            <div className="flex flex-col gap-2 items-center">
              <div className="relative w-full">
                <Input
                  type="text"
                  value={sessionQRCodeUrl}
                  readOnly
                  className="w-full pr-10 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-xl"
                />
                <Button
                  size="icon"
                  onClick={handleCopySessionLink}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  title="Copiar link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {sessionCopied && <span className="text-green-500 text-sm">Copiado!</span>}
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button
              onClick={() => handleSessionQRCodeDialogChange(false)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



 <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-sm border border-blue-200/50 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-xl">
          <FaInfoCircle className="text-blue-600 dark:text-blue-400 text-xl" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
          Como usar as ações
        </h3>
      </div>

      {/* Instructions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Editar */}
        <div className="group">
          <div className="flex items-start gap-4 p-5 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-blue-200/30 dark:border-gray-600/50 hover:shadow-md transition-all duration-300">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FaEdit className="text-blue-600 dark:text-blue-400 text-lg" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                Editar Quiz
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Modifique perguntas, respostas, título ou configurações do seu quiz a qualquer momento.
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="group">
          <div className="flex items-start gap-4 p-5 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-green-200/30 dark:border-gray-600/50 hover:shadow-md transition-all duration-300">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FaChartBar className="text-green-600 dark:text-green-400 text-lg" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                Ver Resultados
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Acesse relatórios detalhados com estatísticas de desempenho e participação dos alunos.
              </p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="group">
          <div className="flex items-start gap-4 p-5 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-orange-200/30 dark:border-gray-600/50 hover:shadow-md transition-all duration-300">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FaQrcode className="text-orange-600 dark:text-orange-400 text-lg" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                Gerenciar Turmas
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Crie turmas específicas e gere QR codes únicos para cada grupo de participantes.
              </p>
            </div>
          </div>
        </div>

        {/* Excluir */}
        <div className="group">
          <div className="flex items-start gap-4 p-5 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-red-200/30 dark:border-gray-600/50 hover:shadow-md transition-all duration-300">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FaTrash className="text-red-600 dark:text-red-400 text-lg" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                Excluir Quiz
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Remove permanentemente o quiz e todos os dados associados. Esta ação é irreversível.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer tip */}
      <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
        <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
          💡 <strong>Dica:</strong> Passe o mouse sobre os botões da tabela para ver mais informações sobre cada ação
        </p>
      </div>
    </div>

      
    </div>
  );
};

export default QuizList;


