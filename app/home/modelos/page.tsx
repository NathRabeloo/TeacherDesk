"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
  FaDownload,
  FaPlus,
  FaFilePdf,
  FaTrash,
  FaUpload,
  FaFileAlt,
} from "react-icons/fa";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

// Interface para o tipo Modelo
interface Modelo {
  id: string;
  nome: string;
  arquivo: string;
  arquivoPath: string;
  usuarioId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const getFileIcon = (filename: string) => {
  if (filename.includes(".docx") || filename.includes(".doc")) return FaFileWord;
  if (filename.includes(".pptx") || filename.includes(".ppt")) return FaFilePowerpoint;
  if (filename.includes(".xlsx") || filename.includes(".xls")) return FaFileExcel;
  if (filename.includes(".pdf")) return FaFilePdf;
  return FaDownload;
};

const getFileGradient = (filename: string) => {
  if (filename.includes(".docx") || filename.includes(".doc")) return "from-blue-500 to-blue-600";
  if (filename.includes(".pptx") || filename.includes(".ppt")) return "from-orange-500 to-red-600";
  if (filename.includes(".xlsx") || filename.includes(".xls")) return "from-green-500 to-green-600";
  if (filename.includes(".pdf")) return "from-red-500 to-red-600";
  return "from-gray-500 to-gray-600";
};

// Função para obter a extensão do arquivo
const getFileExtension = (filename: string): string => {
  const match = filename.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : "";
};

export default function Modelos() {
  const supabase = createClientComponentClient();
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 9;

  const BASE_URL =
    "https://klrdcdnkvdtjoiuwgcaw.supabase.co/storage/v1/object/public/arquivos-modelos/";

  useEffect(() => {
    fetchModelos();
  }, []);

  const fetchModelos = async (extensao?: string) => {
    try {
      setLoading(true);
      // Buscar todos os modelos que não foram excluídos (deletedAt é null)
      const { data, error } = await supabase
        .from("Modelo")
        .select("*")
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erro ao buscar modelos", error);
        return;
      }

      // Filtrar por extensão se especificada
      if (extensao && extensao !== "") {
        const filtrados = data.filter((modelo) =>
          modelo.arquivo.toLowerCase().endsWith(extensao.toLowerCase())
        );
        setModelos(filtrados);
      } else {
        setModelos(data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar modelos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtro e paginação
  const totalPaginas = Math.ceil(modelos.length / itensPorPagina);
  const modelosPaginados = modelos.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const handleUpload = async () => {
    if (!file || !nome) {
      alert("Preencha o nome e selecione um arquivo.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Arquivo muito grande. O limite é 10MB.");
      return;
    }

    const extensoesPermitidas = [".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".pdf"];
    const extensao = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!extensoesPermitidas.includes(extensao)) {
      alert("Tipo de arquivo não permitido.");
      return;
    }

    try {
      setUploading(true);

      // Sanitizar o nome do arquivo para evitar problemas no armazenamento
      const sanitizedFileName = file.name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w.-]/g, "_");

      // Criar um nome único para o arquivo no bucket
      const arquivoPath = `${Date.now()}-${sanitizedFileName}`;

      // Upload do arquivo para o bucket
      const { error: storageError } = await supabase
        .storage
        .from("arquivos-modelos")
        .upload(arquivoPath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        console.error("Erro detalhado ao subir arquivo:", storageError);
        alert(`Erro ao subir arquivo: ${storageError.message || 'Erro desconhecido'}. Verifique o nome do arquivo ou tente novamente.`);
        return;
      }

      // Inserir na tabela Modelo com o caminho do arquivo no bucket
      const { error: insertError } = await supabase.from("Modelo").insert({
        nome,
        arquivo: file.name,
        arquivoPath, // Salva o caminho do arquivo no bucket
      });

      if (insertError) {
        console.error("Erro ao salvar metadados:", insertError);
        alert("Erro ao salvar metadados.");

        // Se falhar ao inserir no banco, remover o arquivo do bucket para evitar arquivos órfãos
        await supabase
          .storage
          .from("arquivos-modelos")
          .remove([arquivoPath]);

        return;
      }

      // Limpar o formulário e fechar o diálogo
      setNome("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setOpen(false);

      // Atualizar a lista de modelos
      fetchModelos();
      setPaginaAtual(1); // Resetar para a primeira página após adicionar novo modelo
    } catch (error) {
      console.error("Erro durante o upload:", error);
      alert("Ocorreu um erro durante o upload. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  // Função para excluir um modelo (exclusão lógica)
  const handleDelete = async (id: string, arquivoPath: string) => {
    if (!confirm("Tem certeza que deseja excluir este modelo?")) {
      return;
    }

    try {
      // Atualiza o campo deletedAt para a data atual (exclusão lógica)
      const { error } = await supabase
        .from("Modelo")
        .update({ deletedAt: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir modelo:", error);
        alert("Erro ao excluir modelo.");
        return;
      }

      // Atualiza a lista de modelos
      fetchModelos();
      // Ajustar página atual se necessário
      if (modelosPaginados.length === 1 && paginaAtual > 1) {
        setPaginaAtual(paginaAtual - 1);
      }
    } catch (error) {
      console.error("Erro ao excluir modelo:", error);
      alert("Ocorreu um erro ao excluir o modelo.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
                <FaDownload className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Biblioteca de Modelos
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                  Escolha e baixe os modelos disponíveis
                </p>
              </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 text-lg font-semibold">
                  <FaPlus />
                  Novo Modelo
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-2xl bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                      <FaFileAlt className="text-white text-xl" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Adicionar Novo Modelo</DialogTitle>
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-gray-700 dark:text-gray-300 font-medium">
                      Nome do Modelo
                    </Label>
                    <Input
                      id="nome"
                      placeholder="Digite o nome do modelo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="rounded-lg border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arquivo" className="text-gray-700 dark:text-gray-300 font-medium">
                      Arquivo
                    </Label>
                    <div className="relative">
                      <Input
                        id="arquivo"
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        accept=".doc,.docx,.ppt,.pptx,.xls,.xlsx,.pdf"
                        className="rounded-lg border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      />
                      {file && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-gray-700 rounded-lg flex items-center gap-2">
                          <FaFileAlt className="text-blue-500 dark:text-blue-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {file.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Formatos aceitos: .doc, .docx, .ppt, .pptx, .xls, .xlsx, .pdf (máx. 10MB)
                    </p>
                  </div>
                </div>

                <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="rounded-lg"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || !nome || !file}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <FaUpload />
                        <span>Enviar Modelo</span>
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3 mt-8 mb-4">
            {["", ".pdf", ".pptx", ".xlsx", ".docx"].map((ext) => {
              const isTodos = ext === "";
              const gradientHover = (() => {
                if (ext.includes(".docx")) return "hover:from-blue-500 hover:to-blue-700";
                if (ext.includes(".pptx")) return "hover:from-orange-500 hover:to-orange-700";
                if (ext.includes(".xlsx")) return "hover:from-green-500 hover:to-green-700";
                if (ext.includes(".pdf")) return "hover:from-red-500 hover:to-red-700";
                return "hover:from-gray-500 hover:to-gray-600";
              })();

              return (
                <Button
                  key={ext}
                  onClick={() => {
                    fetchModelos(ext || undefined);
                    setPaginaAtual(1); // Resetar para a primeira página ao mudar filtro
                  }}
                  variant={isTodos ? "default" : "outline"}
                  className={`rounded-xl transition-all duration-300 ${isTodos
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-gray-100 hover:to-gray-400 hover:text-black"
                      : `bg-white text-black border ${gradientHover} hover:text-white hover:bg-gradient-to-r`
                    }`}
                >
                  {isTodos ? "Todos" : ext.toUpperCase()}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Carregando modelos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {modelosPaginados.map((modelo) => {
                const IconComponent = getFileIcon(modelo.arquivo);
                const gradient = getFileGradient(modelo.arquivo);
                const extensao = getFileExtension(modelo.arquivo);

                // Construir a URL completa do arquivo no bucket
                const fileUrl = modelo.arquivoPath
                  ? `${BASE_URL}${modelo.arquivoPath}`
                  : "#";

                return (
                  <Card
                    key={modelo.id}
                    className="hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-800"
                  >
                    <CardContent className="flex flex-col items-center p-8 text-center space-y-6">
                      <div className="flex justify-between w-full">
                        <div className={`bg-gradient-to-r ${gradient} p-4 rounded-2xl shadow-lg`}>
                          <IconComponent className="text-4xl text-white" />
                        </div>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                className="rounded-xl"
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(modelo.id, modelo.arquivoPath);
                                }}
                              >
                                <FaTrash className="text-red-500 hover:text-red-700" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir modelo</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {modelo.nome}
                        </h3>
                        <div className="flex items-center justify-center gap-2">
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300">
                            {extensao.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r ${gradient} text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 no-underline`}
                      >
                        <FaDownload className="text-lg" />
                        <span>Baixar Modelo</span>
                        <span className="sr-only">Baixar {modelo.nome}</span>
                      </a>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!loading && modelos.length === 0 && (
            <div className="text-center py-16">
              <div className="flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-6">
                <FaDownload className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Nenhum modelo disponível
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Adicione modelos clicando no botão Novo Modelo.
              </p>
            </div>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <Button 
                disabled={paginaAtual === 1 || loading} 
                onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                className="rounded-xl"
                variant="outline"
              >
                Anterior
              </Button>
              {Array.from({ length: totalPaginas }, (_, i) => (
                <Button
                  key={i}
                  variant={paginaAtual === i + 1 ? 'default' : 'outline'}
                  onClick={() => setPaginaAtual(i + 1)}
                  disabled={loading}
                  className="rounded-xl"
                >
                  {i + 1}
                </Button>
              ))}
              <Button 
                disabled={paginaAtual === totalPaginas || loading} 
                onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                className="rounded-xl"
                variant="outline"
              >
                Próximo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
