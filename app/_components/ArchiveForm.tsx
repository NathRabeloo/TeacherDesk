"use client";

import React, { useState, useRef } from "react";
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        const lines = content
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);
        setArquivoItems(lines);
      };
      reader.readAsText(file);
    } else {
      alert("Por favor, selecione um arquivo .txt válido.");
    }
  };

  const removeItem = (item: string) => {
    setArquivoItems((prev) => prev.filter((i) => i !== item));
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-full bg-[#5A9BF6] dark:bg-dark-primary text-white p-4 md:p-6 rounded-2xl shadow-lg flex flex-col gap-4">

      <div className="grid grid-cols-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#4A86E8] hover:bg-[#3B76D4] px-1 py-1 rounded-lg text-white text-sm"
        >
          Selecionar o Arquivo .TXT
        </button>
      </div>

      <input
        type="file"
        accept=".txt"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />

      {arquivoItems.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-sm text-white mt-2">
            <div>{arquivoItems.length} itens carregados.</div>

            <div className="overflow-y-auto h-[200px]">
              <div className="w-full grid grid-cols-3">
                {arquivoItems.map((item, index) => (
                  <div key={index} className="flex items-center bg-white rounded-lg mx-1 mt-1">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArchiveChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg text-black"
                      placeholder={`Item ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeArchiveItem(index)}
                      className="text-black hover:bg-red-600 rounded-lg px-2 py-1 text-sm mx-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={addArchiveItem}
              className="bg-[#4A86E8] hover:bg-[#3B76D4] px-4 py-2 rounded-lg text-white text-sm mt-4"
            >
              + Adicionar item
            </button>

            <div className="mt-2 flex items-center gap-2">
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

          <div className="mt-1">
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
        <div className="mt-3 text-center text-7xl font-bold text-azulteacherdesk-900 animate-bounce uppercase">
          🎉 {selectedResult} 🎉
        </div>
      )}

      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => {
            setArquivoItems([]);
            setSelectedResult("");
            setRemoveAfterDraw(false);
          }}
          className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Limpar tudo
        </button>
      </div>
    </form>
  );
};

export default ArquivoForm;
