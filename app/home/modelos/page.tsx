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
} from "@/components/ui/dialog";
import {
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
  FaDownload,
  FaPlus,
  FaFilePdf,
} from "react-icons/fa";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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

export default function Modelos() {
  const supabase = createClientComponentClient();
  const [modelos, setModelos] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BASE_URL =
    "https://klrdcdnkvdtjoiuwgcaw.supabase.co/storage/v1/object/public/arquivos-modelos/";

  useEffect(() => {
    fetchModelos();
  }, []);

  const fetchModelos = async (extensao?: string) => {
    const { data, error } = await supabase.from("Modelo").select("*");
    if (error) {
      console.error("Erro ao buscar modelos", error);
      return;
    }

    if (extensao) {
      const filtrados = data.filter((modelo) =>
        modelo.arquivo.toLowerCase().endsWith(extensao.toLowerCase())
      );
      setModelos(filtrados);
    } else {
      setModelos(data);
    }
  };

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

    const sanitizedFileName = file.name
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w.-]/g, "_");

    const arquivoPath = `${Date.now()}-${sanitizedFileName}`;

    const { error: storageError } = await supabase
      .storage
      .from("arquivos-modelos")
      .upload(arquivoPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (storageError) {
      console.error("Erro ao subir arquivo:", storageError);
      alert("Erro ao subir arquivo. Verifique o nome do arquivo ou tente novamente.");
      return;
    }

    const { error: insertError } = await supabase.from("Modelo").insert({
      nome,
      arquivo: file.name,
      arquivoPath,
    });

    if (insertError) {
      console.error("Erro ao salvar metadados:", insertError);
      alert("Erro ao salvar metadados.");
      return;
    }

    setNome("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setOpen(false);
    fetchModelos();
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

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Modelo</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <Input
                    placeholder="Nome do modelo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <Button onClick={handleUpload}>Enviar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filtros */}
          <div className="flex gap-3 mt-8 mb-4">
            {["", ".docx", ".pptx", ".xlsx", ".pdf"].map((ext) => (
              <Button
                key={ext}
                onClick={() => fetchModelos(ext || undefined)}
                variant={ext === "" ? "default" : "outline"}
              >
                {ext === "" ? "Todos" : ext.toUpperCase()}
              </Button>
            ))}
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {modelos.map((modelo) => {
                const IconComponent = getFileIcon(modelo.arquivo);
                const gradient = getFileGradient(modelo.arquivo);

                return (
                  <Card
                    key={modelo.id}
                    className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-800"
                  >
                    <CardContent className="flex flex-col items-center p-8 text-center space-y-6">
                      <div className={`bg-gradient-to-r ${gradient} p-4 rounded-2xl shadow-lg`}>
                        <IconComponent className="text-4xl text-white" />
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {modelo.nome}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed break-words">
                          {modelo.arquivo}
                        </p>
                      </div>

                      <a
                        href={new URL(modelo.arquivoPath.replace(/^\/+/, ""), BASE_URL).toString()}
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

            {modelos.length === 0 && (
              <div className="text-center py-16">
                <div className="flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-6">
                  <FaDownload className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Nenhum modelo disponível
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Os modelos serão adicionados em breve.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
