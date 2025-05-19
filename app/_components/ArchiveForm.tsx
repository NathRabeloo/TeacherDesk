"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import * as mammoth from "mammoth";
import SpinningWheel from "./SpinningWheel";

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

    setLoading(true); // começa o carregamento
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
      }
      else {
        alert("Formato de arquivo não suportado. Use .txt, .csv, .xlsx ou .docx.");
        setLoading(false);
      }
    } catch (err) {
      alert("Erro ao ler o arquivo.");
      setLoading(false);
    } finally {
      // resetar o valor para permitir subir o mesmo arquivo novamente
      event.target.value = "";
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-full bg-[#5A9BF6] dark:bg-dark-primary text-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl flex flex-col gap-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#4A86E8] hover:bg-[#3B76D4] px-4 py-2 rounded-lg text-white text-sm sm:text-base w-full sm:w-auto"
        >
          Selecionar Arquivo
        </button>
      </div>

      <input
        type="file"
        accept=".txt,.csv,.xlsx,.docx"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />

      {arquivoItems.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Itens */}
          <div>
            <p className="text-sm mb-2">{arquivoItems.length} itens carregados</p>

            <div className="overflow-y-auto max-h-[300px] pr-1 space-y-2">
              {arquivoItems.map((item, index) => (
                <div key={index} className="flex items-center bg-white rounded-md p-2 text-black">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArchiveChange(index, e.target.value)}
                    className="flex-1 px-2 py-1 text-sm rounded bg-gray-100 outline-none"
                    placeholder={`Item ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArchiveItem(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addArchiveItem}
              className="mt-4 bg-[#4A86E8] hover:bg-[#3B76D4] px-4 py-2 rounded-lg text-sm w-full sm:w-auto"
            >
              + Adicionar item
            </button>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={removeAfterDraw}
                onChange={(e) => setRemoveAfterDraw(e.target.checked)}
                id="removeAfterDraw"
              />
              <label htmlFor="removeAfterDraw" className="text-sm">
                Remover item sorteado da lista
              </label>
            </div>
          </div>

          {/* Roda da Sorte */}
          <div className="w-full flex justify-center items-center">
            <SpinningWheel
              items={arquivoItems.filter((item) => item.trim() !== "")}
              onFinish={(winner) => {
                setSelectedResult(winner);
                onSubmit(winner);
                if (removeAfterDraw) {
                  removeItem(winner);
                }
              }}
            />
          </div>
        </div>
      )}

      {selectedResult && (
        <div className="mt-6 text-center text-4xl sm:text-6xl md:text-7xl font-bold text-white animate-bounce uppercase">
          🎉 {selectedResult} 🎉
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setArquivoItems([]);
            setSelectedResult("");
            setRemoveAfterDraw(false);
          }}
          className={`px-4 py-2 rounded-lg text-sm sm:text-base text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-700"
            }`}
        >
          Limpar tudo
        </button>
      </div>
    </form>
  );
};

export default ArquivoForm;
