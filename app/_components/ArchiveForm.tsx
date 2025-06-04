"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import * as mammoth from "mammoth";
import SpinningWheel from "./SpinningWheel";
import { FaFileUpload, FaPlus, FaTrash, FaCog, FaDice, FaSpinner, FaFileAlt, FaEdit } from "react-icons/fa";

interface ArquivoFormProps {
  initialData?: { list?: string[] };
  onSubmit: (data: any) => void;
}

const ArquivoForm: React.FC<ArquivoFormProps> = ({ onSubmit }) => {
  const [arquivoItems, setArquivoItems] = useState<string[]>([]);
  const [removeAfterDraw, setRemoveAfterDraw] = useState(false);
  const [selectedResult, setSelectedResult] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  const handleArchiveChange = (index: number, value: string) => {
    const updated = [...arquivoItems];
    updated[index] = value;
    setArquivoItems(updated);
  };

  const removeArchiveItem = (index: number) => {
    const updated = [...arquivoItems];
    updated.splice(index, 1);
    setArquivoItems(updated);
  };

  const addArchiveItem = () => {
    setArquivoItems([...arquivoItems, ""]);
  };

  const removeItem = (item: string) => {
    setArquivoItems((prev) => prev.filter((i) => i !== item));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    const extension = file.name.split(".").pop()?.toLowerCase();

    try {
      if (extension === "txt") {
        reader.onload = () => {
          const content = reader.result as string;
          const lines = content.split("\n").map(line => line.trim()).filter(Boolean);
          setArquivoItems(lines);
          setLoading(false);
        };
        reader.readAsText(file);
      } else if (extension === "csv") {
        reader.onload = () => {
          const content = reader.result as string;
          const lines = content.split("\n").flatMap(line => line.split(",")).map(item => item.trim()).filter(Boolean);
          setArquivoItems(lines);
          setLoading(false);
        };
        reader.readAsText(file);
      } else if (extension === "xlsx") {
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          const items = (jsonData as string[][]).flat().filter(item => item);
          setArquivoItems(items);
          setLoading(false);
        };
        reader.readAsArrayBuffer(file);
      } else if (extension === "docx") {
        reader.onload = () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          mammoth.extractRawText({ arrayBuffer }).then(result => {
            const lines = result.value.split("\n").map(line => line.trim()).filter(Boolean);
            setArquivoItems(lines);
          }).catch(() => {
            alert("Erro ao ler o arquivo .docx.");
          }).finally(() => {
            setLoading(false);
          });
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("Formato de arquivo não suportado. Use .txt, .csv, .xlsx ou .docx.");
        setLoading(false);
      }
    } catch (err) {
      alert("Erro ao ler o arquivo.");
      setLoading(false);
    } finally {
      event.target.value = "";
    }
  };

  const validItems = arquivoItems.filter((item) => item.trim() !== "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-2xl mb-6">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600 rounded-t-2xl">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <FaFileUpload className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Sorteio por Arquivo
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Carregue um arquivo com os itens a serem sorteados
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
              
              {/* Seção de Upload */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border-2 border-dashed border-indigo-300 dark:border-gray-600">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="bg-indigo-500 p-3 rounded-full">
                      <FaFileAlt className="text-white text-2xl" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Carregar Arquivo
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Suporte para arquivos: .txt, .csv, .xlsx, .docx
                  </p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className={`${
                      loading 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
                    } text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 mx-auto`}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin text-xl" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        <FaFileUpload className="text-xl" />
                        Selecionar Arquivo
                      </>
                    )}
                  </button>

                  <input
                    type="file"
                    accept=".txt,.csv,.xlsx,.docx"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {/* Conteúdo Principal - Grid */}
              {arquivoItems.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Seção da Lista */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-green-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-500 p-2 rounded-lg">
                          <FaEdit className="text-white text-lg" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Itens Carregados
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {validItems.length} item(s) válido(s)
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={addArchiveItem}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                      >
                        <FaPlus className="text-sm" />
                        Adicionar
                      </button>
                    </div>

                    {/* Lista de Inputs */}
                    <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                      {arquivoItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => handleArchiveChange(index, e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                              placeholder={`Item ${index + 1}`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeArchiveItem(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                            title="Remover item"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Configurações */}
                    <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-3">
                        <FaCog className="text-gray-500 dark:text-gray-400" />
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={removeAfterDraw}
                            onChange={(e) => setRemoveAfterDraw(e.target.checked)}
                            className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            Remover item sorteado da lista
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Seção da Roleta */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-purple-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <FaDice className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Roda da Sorte
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {validItems.length >= 2 ? "Pronto para sortear!" : "Adicione pelo menos 2 itens"}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center items-center min-h-[350px]">
                      {validItems.length >= 2 ? (
                        <SpinningWheel
                          items={validItems}
                          onFinish={(winner) => {
                            setSelectedResult(winner);
                            onSubmit(winner);
                            if (removeAfterDraw) {
                              removeItem(winner);
                            }
                          }}
                        />
                      ) : (
                        <div className="text-center py-12">
                          <div className="bg-gray-200 dark:bg-gray-700 w-64 h-64 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaDice className="text-6xl text-gray-400 dark:text-gray-500" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {arquivoItems.length === 0 
                              ? "Carregue um arquivo para começar" 
                              : "Adicione pelo menos 2 itens válidos"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Resultado */}
              {selectedResult && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-2xl p-8 text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="bg-green-500 p-3 rounded-full">
                      <FaDice className="text-white text-2xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-green-800 dark:text-green-300">
                      Resultado do Sorteio
                    </h2>
                  </div>
                  <div className="text-6xl font-bold text-green-700 dark:text-green-300 animate-bounce uppercase mb-4">
                    🎉 {selectedResult} 🎉
                  </div>
                  <p className="text-lg text-green-600 dark:text-green-400">
                    Parabéns ao(à) sorteado(a)!
                  </p>
                </div>
              )}

              {/* Botão Limpar */}
              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setArquivoItems([]);
                    setSelectedResult("");
                    setRemoveAfterDraw(false);
                  }}
                  className={`${
                    loading 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  } text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3`}
                >
                  <FaTrash className="text-lg" />
                  Limpar Tudo
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArquivoForm;