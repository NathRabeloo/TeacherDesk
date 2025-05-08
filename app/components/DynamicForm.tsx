"use client";

import React, { useState } from "react";

type FormType = "range" | "list" | "arquivo";

interface DynamicFormProps {
    formType: FormType;
    onSubmit: (data: any) => void;
    initialData?: any;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ formType, onSubmit, initialData }) => {
    const [range, setRange] = useState({ min: initialData?.min || "", max: initialData?.max || "" });
    const [list, setList] = useState<string[]>(initialData?.list || [""]);
    const [question, setQuestion] = useState({ text: initialData?.text || "", answer: initialData?.answer || "" });

    const [shuffling, setShuffling] = useState(false);
    const [shuffledValue, setShuffledValue] = useState("");
    const [selectedResult, setSelectedResult] = useState("");

    const handleListChange = (index: number, value: string) => {
        const updated = [...list];
        updated[index] = value;
        setList(updated);
    };

    const addListItem = () => setList([...list, ""]);

    const shuffleAndSelect = (items: string[], onDone: (selected: string) => void) => {
        setShuffling(true);
        let count = 0;
        const maxCount = 25;
        const interval = setInterval(() => {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            setShuffledValue(randomItem);
            count++;
            if (count >= maxCount) {
                clearInterval(interval);
                setShuffling(false);
                setSelectedResult(randomItem);
                onDone(randomItem);
            }
        }, 80);
    };

    const handleRangeDraw = () => {
        const min = parseInt(range.min, 10);
        const max = parseInt(range.max, 10);

        if (isNaN(min) || isNaN(max) || min > max) {
            alert("Por favor, insira valores válidos para mínimo e máximo.");
            return;
        }

        const possibleNumbers = Array.from({ length: max - min + 1 }, (_, i) => (min + i).toString());
        shuffleAndSelect(possibleNumbers, onSubmit);
    };

    const handleListDraw = () => {
        const validItems = list.filter((item) => item.trim() !== "");
        if (validItems.length === 0) {
            alert("Adicione pelo menos um item à lista.");
            return;
        }
        shuffleAndSelect(validItems, onSubmit);
    };

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full h-96 max-w-3xl bg-[#5A9BF6] dark:bg-dark-primary text-white p-4 md:p-6 rounded-2xl shadow-lg flex flex-col gap-4"
        >
            {formType === "range" && (
                <>
                    <div>
                        <label className="text-sm block mb-1">Mínimo:</label>
                        <input
                            type="number"
                            value={range.min}
                            onChange={(e) => setRange({ ...range, min: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-black"
                        />
                    </div>
                    <div>
                        <label className="text-sm block mb-1">Máximo:</label>
                        <input
                            type="number"
                            value={range.max}
                            onChange={(e) => setRange({ ...range, max: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-black"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleRangeDraw}
                        className="mt-2 bg-[#4A86E8] hover:bg-[#3B76D4] px-4 py-2 rounded-lg text-white font-semibold"
                    >
                        Sortear Número
                    </button>
                </>
            )}

            {formType === "list" && (
                <>
                    <label className="w-full text-sm block mb-1">Lista de Itens:</label>
                    {/* ADICIONAR ESSA DIV no list.map */}
                    <div className="overflow-y-auto">
                        {list.map((item, index) => (
                            <input
                                key={index}
                                type="text"
                                value={item}
                                onChange={(e) => handleListChange(index, e.target.value)}
                                className="px-3 py-2 rounded-lg text-black m-1"
                                placeholder={`Item ${index + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addListItem}
                        className="bg-[#4A86E8] hover:bg-[#3B76D4] px-4 py-2 rounded-lg text-white text-sm"
                    >
                        + Adicionar item
                    </button>

                    <button
                        type="button"
                        onClick={handleListDraw}
                        className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-semibold"
                    >
                        Sortear da Lista
                    </button>
                </>
            )}

            {formType === "arquivo" && (
                <>
                    <div>
                        <label className="text-sm block mb-1">Pergunta:</label>
                        <input
                            type="text"
                            value={question.text}
                            onChange={(e) => setQuestion({ ...question, text: e.target.value })}
                            className=" px-3 py-2 rounded-lg text-black"
                            placeholder="Digite sua pergunta"
                        />
                    </div>
                    <div>
                        <label className="text-sm block mb-1">Resposta Correta:</label>
                        <input
                            type="text"
                            value={question.answer}
                            onChange={(e) => setQuestion({ ...question, answer: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-black"
                            placeholder="Digite a resposta correta"
                        />
                    </div>
                </>
            )}

            {shuffling && (
                <div className="mt-6 text-center text-3xl font-bold animate-pulse">
                    {shuffledValue}
                </div>
            )}
            {!shuffling && selectedResult && (
                <div className="mt-6 text-center text-4xl font-bold text-azulteacherdesk-900 transition-all duration-500">
                    🎉 {selectedResult} 🎉
                </div>
            )}
        </form>
    );
};

export default DynamicForm;
