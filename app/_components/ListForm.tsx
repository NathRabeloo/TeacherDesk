"use client";

import React, { useState } from "react";
import SpinningWheel from "./SpinningWheel";
import { FaList, FaPlus, FaTrash, FaCog, FaDice } from "react-icons/fa";

interface ListFormProps {
  initialData?: { list?: string[] };
  onSubmit: (data: any) => void;
}

const ListForm: React.FC<ListFormProps> = ({ initialData, onSubmit }) => {
  const [list, setList] = useState<string[]>(initialData?.list || [""]);
  const [removeAfterDraw, setRemoveAfterDraw] = useState(false);
  const [selectedResult, setSelectedResult] = useState("");

  const handleListChange = (index: number, value: string) => {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  };

  const addListItem = () => setList([...list, ""]);

  const removeListItem = (index: number) => {
    const updated = [...list];
    updated.splice(index, 1);
    setList(updated);
  };

  const removeItem = (item: string) => {
    setList((prev) => prev.filter((i) => i !== item));
  };

  const validItems = list.filter((item) => item.trim() !== "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-2xl mb-6">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600 rounded-t-2xl">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <FaList className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Sorteio por Lista
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Digite uma lista de itens e sorteie aleatoriamente
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
              {/* Grid Principal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Seção da Lista */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <FaList className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Lista de Itens
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {validItems.length} item(s) válido(s)
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={addListItem}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    >
                      <FaPlus className="text-sm" />
                      Adicionar
                    </button>
                  </div>

                  {/* Lista de Inputs */}
                  <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                    {list.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleListChange(index, e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder={`Item ${index + 1}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeListItem(index)}
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
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
                          Adicione pelo menos 2 itens para começar
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

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
                  onClick={() => {
                    setList([""]);
                    setSelectedResult("");
                    setRemoveAfterDraw(false);
                  }}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
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

export default ListForm;