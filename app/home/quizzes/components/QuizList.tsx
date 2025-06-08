"use client";

import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaQrcode, FaChartBar, FaSearch, FaFilter, FaPlus, FaUsers, FaQuestionCircle, FaHistory } from "react-icons/fa";
import QRCode from "react-qr-code";
import { Copy } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

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

  const handleSessionDialogChange = (open: boolean) => {
    setIsSessionDialogOpen(open);
    if (!open) {
      setSelectedQuiz(null);
      setSessoes([]);
      setNewSessionName("");
    }
  };

  const handleCreateSession = async () => {
    if (!selectedQuiz) return;

    setIsCreatingSession(true);
    try {
      const sessaoNome = newSessionName.trim() || `Sessão ${new Date().toLocaleDateString()}`;
      const novaSessao = await criarSessaoQuiz(selectedQuiz.id, sessaoNome);

      // Atualizar a lista de sessões
      const sessoes = await listarSessoesQuiz(selectedQuiz.id);
      setSessoes(sessoes);
      setNewSessionName("");
    } catch (error) {
      console.error("Erro ao criar sessão:", error);
      alert("Erro ao criar nova sessão de quiz");
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
      console.error("Erro ao obter link da sessão:", error);
      alert("Erro ao gerar link da sessão");
    }
  };

  // Nova função para excluir sessão
  const handleDeleteSession = async (sessionId: string, sessionName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a sessão "${sessionName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await excluirSessaoQuiz(sessionId);

      // Atualizar a lista de sessões após exclusão
      if (selectedQuiz) {
        const sessoesAtualizadas = await listarSessoesQuiz(selectedQuiz.id);
        setSessoes(sessoesAtualizadas);
      }

      alert("Sessão excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir sessão:", error);
      alert("Erro ao excluir sessão. Tente novamente.");
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
      console.error("Erro ao gerar QR Code da sessão:", error);
      alert("Erro ao gerar QR Code da sessão");
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
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Questionários</p>
              <p className="text-3xl font-bold mt-1">{quizzes.length}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-3 rounded-xl">
              <FaQuestionCircle className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Disciplinas Ativas</p>
              <p className="text-3xl font-bold mt-1">{disciplinas.length}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 p-3 rounded-xl">
              <FaUsers className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Questionários Filtrados</p>
              <p className="text-3xl font-bold mt-1">{filteredQuizzes.length}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 p-3 rounded-xl">
              <FaFilter className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Área de Filtros e Pesquisa */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-blue-500 p-2 rounded-lg">
              <FaSearch className="text-white text-lg" />
            </div>
            <Input
              placeholder="Buscar questionário por título..."
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
            Novo Questionário
          </Button>
        </div>
      </div>

      {/* Área de Conteúdo Principal */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300">Carregando questionários...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <FaQuestionCircle className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Nenhum questionário encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              {searchQuery || selectedDisciplina
                ? "Tente ajustar os filtros de pesquisa"
                : "Comece criando seu primeiro questionário"}
            </p>
            <Button
              onClick={onCreateQuiz}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
            >
              <FaPlus className="text-xl" />
              Criar Primeiro Questionário
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                  <TableHead className="text-left py-4 px-6 font-bold text-gray-900 dark:text-white text-lg">
                    Título do Questionário
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
                    className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
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
                          title="Editar Questionário"
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
                          onClick={() => handleOpenSessionDialog(quiz)}
                          title="Gerenciar Sessões"
                          className="h-10 w-10 rounded-xl border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:hover:border-amber-600 dark:hover:bg-amber-900 transition-all duration-200"
                        >
                          <FaHistory className="text-amber-600 dark:text-amber-400" />
                        </Button>

                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setSelectedQuiz(quiz);
                            setIsQRCodeOpen(true);
                          }}
                          title="Gerar QR Code"
                          className="h-10 w-10 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:border-purple-600 dark:hover:bg-purple-900 transition-all duration-200"
                        >
                          <FaQrcode className="text-purple-600 dark:text-purple-400" />
                        </Button>

                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDelete(quiz.id)}
                          title="Excluir Questionário"
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

      {/* Dialog do QR Code do Quiz */}
      <Dialog open={isQRCodeOpen} onOpenChange={handleQRCodeDialogChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              QR Code do Questionário
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            {selectedQuiz && (
              <>
                <div className="bg-white p-4 rounded-2xl shadow-lg">
                  <QRCode value={qrCodeUrl} size={200} />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedQuiz.titulo}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 break-all bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    {qrCodeUrl}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Copy className={copied ? "text-green-500" : ""} />
                  {copied ? "Link Copiado!" : "Copiar Link"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog do QR Code da Sessão */}
      <Dialog open={isSessionQRCodeOpen} onOpenChange={handleSessionQRCodeDialogChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              QR Code da Sessão
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            {selectedSession && (
              <>
                <div className="bg-white p-4 rounded-2xl shadow-lg">
                  <QRCode value={sessionQRCodeUrl} size={200} />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedSession.nome}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedQuiz?.titulo}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 break-all bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    {sessionQRCodeUrl}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCopySessionLink}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Copy className={sessionCopied ? "text-green-500" : ""} />
                  {sessionCopied ? "Link Copiado!" : "Copiar Link"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Sessões */}
      <Dialog open={isSessionDialogOpen} onOpenChange={handleSessionDialogChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              Sessões do Questionário
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedQuiz && (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedQuiz.titulo}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Gerencie as sessões deste questionário para aplicá-lo a diferentes grupos.
                  </p>
                </div>

                {/* Criar nova sessão */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Criar Nova Sessão
                  </h4>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Nome da sessão (ex: Turma A, Grupo 2)"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleCreateSession}
                      disabled={isCreatingSession}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      {isCreatingSession ? "Criando..." : "Criar Sessão"}
                    </Button>
                  </div>
                </div>

                {/* Lista de sessões */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-700 py-3 px-4 border-b border-gray-200 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Sessões Existentes
                    </h4>
                  </div>

                  {isLoadingSessions ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                      <p className="text-gray-600 dark:text-gray-400">Carregando sessões...</p>
                    </div>
                  ) : sessoes.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">
                        Nenhuma sessão encontrada. Crie uma nova sessão para começar.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-600">
                      {sessoes.map((sessao) => (
                        <div key={sessao.id} className="py-4 px-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {sessao.nome}
                            </p>
                            <div className="flex gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                              <span>Data: {sessao.data}</span>
                              <span>Participantes: {sessao.participantes}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateSessionQRCode(sessao)}
                              title="Gerar QR Code da Sessão"
                              className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-700 dark:hover:bg-purple-900"
                            >
                              <FaQrcode className="w-4 h-4" />
                            </Button>

                            {onViewResults && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  onViewResults(selectedQuiz.id, sessao.id);
                                  setIsSessionDialogOpen(false);
                                }}
                                title="Ver Resultados da Sessão"
                                className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900"
                              >
                                <FaChartBar className="w-4 h-4" />
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSession(sessao.id, sessao.nome)}
                              title="Excluir Sessão"
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900"
                            >
                              <FaTrash className="w-4 h-4" />
                            </Button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizList;

