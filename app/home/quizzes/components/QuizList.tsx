"use client";

import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaQrcode } from "react-icons/fa";
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

interface QuizListProps {
  onCreateQuiz: () => void;
  onEditQuiz: (quizId: string) => void;
}

const QuizList: React.FC<QuizListProps> = ({ onCreateQuiz, onEditQuiz }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold">Meus Quizzes</h2>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Buscar quiz..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />

        <Select
          onValueChange={(value) => setSelectedDisciplina(value === "all" ? null : value)}
          value={selectedDisciplina ?? "all"}
        >
          <SelectTrigger className="w-[200px]">
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

        <Button onClick={onCreateQuiz}>Criar novo quiz</Button>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Carregando...</p>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-8 bg-white rounded shadow">
          <p className="text-gray-500">Nenhum quiz encontrado.</p>
          <Button className="mt-4" onClick={onCreateQuiz}>
            Criar Primeiro Quiz
          </Button>
        </div>
      ) : (
        <div className="rounded-md border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell>{quiz.titulo}</TableCell>
                  <TableCell>
                    {disciplinas.find((d) => d.id === quiz.disciplina_id)?.nome ?? "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onEditQuiz(quiz.id)}
                        title="Editar Quiz"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDelete(quiz.id)}
                        title="Excluir Quiz"
                      >
                        <FaTrash />
                      </Button>
                      <Dialog open={isQRCodeOpen} onOpenChange={handleQRCodeDialogChange}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>QR Code do Quiz</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col items-center space-y-4">
                            {selectedQuiz && (
                              <>
                                <QRCode value={qrCodeUrl} size={180} />
                                <p className="text-sm text-center break-all">
                                  {qrCodeUrl}
                                </p>
                                <Button
                                  variant="outline"
                                  onClick={handleCopy}
                                  className="flex items-center gap-2"
                                >
                                  <Copy size={16} />
                                  {copied ? "Copiado!" : "Copiar link"}
                                </Button>
                              </>
                            )}
                          </div>
                          <DialogFooter>
                            <Button onClick={() => setIsQRCodeOpen(false)}>
                              Fechar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setIsQRCodeOpen(true);
                        }}
                        title="Gerar QR Code"
                      >
                        <FaQrcode />
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
  );
};

export default QuizList;
