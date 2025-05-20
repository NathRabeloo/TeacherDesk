"use client";

import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaQrcode } from "react-icons/fa";
import { createClient } from "@supabase/supabase-js";
import QRCode from "react-qr-code";
import { Copy } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Quiz {
  id: string;
  titulo: string;
}

interface QuizListProps {
  onCreateQuiz: () => void;
  onEditQuiz: (quizId: string) => void;
}

const QuizList: React.FC<QuizListProps> = ({ onCreateQuiz, onEditQuiz }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("Quiz")
          .select("id, titulo");
        if (error) throw error;
        setQuizzes(data || []);
      } catch (error) {
        console.error("Erro ao buscar quizzes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleDelete = async (quizId: string) => {
    if (!confirm("Tem certeza que deseja excluir este quiz?")) return;

    try {
      const { error } = await supabase.from("Quiz").delete().eq("id", quizId);
      if (error) throw error;
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
    } catch (error) {
      console.error("Erro ao excluir quiz:", error);
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

      <Input
        placeholder="Buscar quizzes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

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
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell>{quiz.titulo}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Dialog open={isQRCodeOpen} onOpenChange={handleQRCodeDialogChange}>
                        <DialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => {
                              setSelectedQuiz(quiz);
                              setIsQRCodeOpen(true);
                            }}
                            title="Gerar QR Code"
                          >
                            <FaQrcode size={14} />
                          </Button>
                        </DialogTrigger>
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
                        variant="outline"
                        size="icon"
                        onClick={() => onEditQuiz(quiz.id)}
                        title="Editar Quiz"
                      >
                        <FaEdit size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(quiz.id)}
                        title="Excluir Quiz"
                      >
                        <FaTrash size={16} />
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
