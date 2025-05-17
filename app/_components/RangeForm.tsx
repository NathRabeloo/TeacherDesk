"use client";

import React, { useState } from "react";

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
    <div className="w-full max-w-2xl mx-auto bg-[#5A9BF6] dark:bg-dark-primary text-white p-6 rounded-2xl shadow-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Mínimo:</label>
          <input
            type="number"
            value={range.min}
            onChange={(e) => setRange({ ...range, min: e.target.value })}
            className="w-full px-4 py-2 rounded-lg text-black"
            placeholder="Ex: 1"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Máximo:</label>
          <input
            type="number"
            value={range.max}
            onChange={(e) => setRange({ ...range, max: e.target.value })}
            className="w-full px-4 py-2 rounded-lg text-black"
            placeholder="Ex: 100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Quantidade de sorteios:</label>
        <input
          type="number"
          value={rangeCount}
          min={1}
          onChange={(e) => setRangeCount(parseInt(e.target.value))}
          className="w-full px-4 py-2 rounded-lg text-black"
        />
      </div>

      {alertMessage && (
        <div className="bg-yellow-200 text-yellow-800 font-semibold px-4 py-2 rounded-lg shadow text-center animate-pulse">
          ⚠️ {alertMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <button
          type="button"
          onClick={handleRangeDraw}
          disabled={isRangeExhausted}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg text-white font-semibold transition ${isRangeExhausted
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#4A86E8] hover:bg-[#3B76D4]"
            }`}
        >
          Sortear Número
        </button>

        <div className="flex items-center gap-2">
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

      {selectedResult && (
        <div className="mt-4 px-4 py-3 bg-white text-[#5A9BF6] rounded-xl text-center max-h-40 overflow-y-auto shadow-inner">
          <h2 className="text-2xl font-bold mb-2">🎉 Resultado 🎉</h2>
          <div className="flex flex-wrap justify-center gap-2 text-base sm:text-lg font-semibold">
            {selectedResult.split(", ").map((num, idx) => (
              <span
                key={idx}
                className="bg-[#5A9BF6] text-white px-3 py-1 rounded-lg"
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="bg-red-500 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm"
        >
          Limpar tudo
        </button>
      </div>
    </div>
  );
};

export default RangeForm;
