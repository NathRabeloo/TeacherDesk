"use client";

import React, { useState } from "react";
import { FaHashtag, FaDice, FaTrash, FaExclamationTriangle } from "react-icons/fa";

interface RangeFormProps {
  onSubmit: (result: string) => void;
  initialData?: any;
}

const RangeForm: React.FC<RangeFormProps> = ({ onSubmit, initialData }) => {
  const [range, setRange] = useState({ min: initialData?.min || "", max: initialData?.max || "" });
  const [rangeCount, setRangeCount] = useState(1);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isRangeExhausted, setIsRangeExhausted] = useState(false);
  const [removeAfterDraw, setRemoveAfterDraw] = useState(false);
  const [availableRangeNumbers, setAvailableRangeNumbers] = useState<string[] | null>(null);
  const [selectedResult, setSelectedResult] = useState("");

  const handleRangeDraw = () => {
    const min = parseInt(range.min, 10);
    const max = parseInt(range.max, 10);
    setAlertMessage(null);

    if (isNaN(min) || isNaN(max) || min > max) {
      setAlertMessage("Por favor, insira valores válidos para mínimo e máximo.");
      return;
    }

    let currentAvailable = availableRangeNumbers;
    if (!currentAvailable) {
      currentAvailable = Array.from({ length: max - min + 1 }, (_, i) => (min + i).toString());
    }

    if (currentAvailable.length === 0) {
      setAlertMessage("Acabaram os números disponíveis. Clique em 'Limpar tudo' para reiniciar.");
      setIsRangeExhausted(true);
      return;
    }

    if (rangeCount > currentAvailable.length) {
      setAlertMessage("A quantidade solicitada é maior do que o total disponível.");
      return;
    }

    const selected: string[] = [];
    for (let i = 0; i < rangeCount; i++) {
      const randomIndex = Math.floor(Math.random() * currentAvailable.length);
      selected.push(currentAvailable[randomIndex]);
      if (removeAfterDraw) {
        currentAvailable.splice(randomIndex, 1);
      }
    }

    const result = selected.join(", ");
    setSelectedResult(result);
    onSubmit(result);

    if (removeAfterDraw) {
      setAvailableRangeNumbers(currentAvailable);
      if (currentAvailable.length === 0) {
        setIsRangeExhausted(true);
        setAlertMessage("Acabaram os números disponíveis. Clique em 'Limpar tudo' para reiniciar.");
      }
    }
  };

  const handleReset = () => {
    setRange({ min: "", max: "" });
    setRangeCount(1);
    setSelectedResult("");
    setAlertMessage(null);
    setAvailableRangeNumbers(null);
    setIsRangeExhausted(false);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">


      <div className="p-6 space-y-6">
        {/* Configuração de Intervalo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Número Mínimo
            </label>
            <input
              type="number"
              value={range.min}
              onChange={(e) => setRange({ ...range, min: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="Ex: 1"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Número Máximo
            </label>
            <input
              type="number"
              value={range.max}
              onChange={(e) => setRange({ ...range, max: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="Ex: 100"
            />
          </div>
        </div>

        {/* Quantidade de Sorteios */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Quantidade de Números a Sortear
          </label>
          <input
            type="number"
            value={rangeCount}
            min={1}
            onChange={(e) => setRangeCount(parseInt(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          />
        </div>

        {/* Checkbox */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <input
            type="checkbox"
            checked={removeAfterDraw}
            onChange={(e) => setRemoveAfterDraw(e.target.checked)}
            id="removeAfterDraw"
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="removeAfterDraw" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Remover números sorteados da lista (evita repetições)
          </label>
        </div>

        {/* Mensagem de Alerta */}
        {alertMessage && (
          <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 text-xl flex-shrink-0" />
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">{alertMessage}</p>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="button"
            onClick={handleRangeDraw}
            disabled={isRangeExhausted}
            className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${isRangeExhausted
                ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
          >
            <FaDice className="text-xl" />
            <span>{isRangeExhausted ? "Números Esgotados" : "Sortear Números"}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <FaTrash className="text-lg" />
            <span>Limpar Tudo</span>
          </button>
        </div>

        {/* Resultado */}
        {selectedResult && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-200 dark:border-green-800">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">
              🎉 Número(s) Sorteado(s) 🎉
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {selectedResult.split(", ").map((num, idx) => (
                <span
                  key={idx}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-2xl text-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RangeForm;