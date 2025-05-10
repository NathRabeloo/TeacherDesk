"use client";

import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import * as mammoth from "mammoth";
import dynamic from "next/dynamic";

type FormType = "range" | "list" | "arquivo";

interface DynamicFormProps {
    formType: FormType;
    onSubmit: (data: any) => void;
    initialData?: any;
}

const SpinningWheel = dynamic(() => import("./SpinningWheel"), {
    ssr: false,
});

const DynamicForm: React.FC<DynamicFormProps> = ({ formType, onSubmit, initialData }) => {
    const [range, setRange] = useState({ min: initialData?.min || "", max: initialData?.max || "" });
    const [list, setList] = useState<string[]>(initialData?.list || [""]);
    const [arquivoItems, setArquivoItems] = useState<string[]>([]);
    const [selectedResult, setSelectedResult] = useState("");
    const [shuffling, setShuffling] = useState(false);
    const [shuffledValue, setShuffledValue] = useState("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        setSelectedResult("");
    }, [formType]);

    if (!isClient) {
        return null;
    }

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

        if (isNaN(min) || isNaN(max)) {
            alert("Por favor, insira números válidos.");
            return;
        }

        if (min > max) {
            alert("O valor mínimo não pode ser maior que o valor máximo.");
            return;
        }

        const possibleNumbers = Array.from({ length: max - min + 1 }, (_, i) => (min + i).toString());
        shuffleAndSelect(possibleNumbers, onSubmit);
    };

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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const extension = file.name.split(".").pop()?.toLowerCase();

        try {
            if (extension === "txt") {
                const reader = new FileReader();
                reader.onload = () => {
                    const content = reader.result as string;
                    const lines = content.split("\n").map(line => line.trim()).filter(Boolean);
                    setArquivoItems(lines);
                };
                reader.readAsText(file);
            } else if (extension === "xlsx" || extension === "xls") {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
                    const lines = json.flat().map(cell => cell?.toString()?.trim()).filter(Boolean);
                    setArquivoItems(lines);
                };
                reader.readAsArrayBuffer(file);
            }
            else if (extension === "pdf") {
                console.log("Não foi implementado");
                alert("Não foi implementado");
            }
            else if (extension === "docx") {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const arrayBuffer = e.target?.result as ArrayBuffer;
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    const lines = result.value.split("\n").map(line => line.trim()).filter(Boolean);
                    setArquivoItems(lines);
                };
                reader.readAsArrayBuffer(file);
            } else {
                alert("Formato de arquivo não suportado.");
            }
        } catch (error) {
            console.error("Erro ao ler o arquivo:", error);
            alert("Ocorreu um erro ao processar o arquivo.");
        }
    };

    const handleArquivoDraw = () => {
        if (arquivoItems.length === 0) {
            alert("Nenhum item carregado do arquivo.");
            return;
        }

        shuffleAndSelect(arquivoItems, onSubmit);
    };

    return (
        <form onSubmit={(e) => e.preventDefault()} className="w-full bg-[#5A9BF6] dark:bg-dark-primary text-white p-4 md:p-6 rounded-2xl shadow-lg flex flex-col gap-4">
            {formType === "range" && (
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex flex-col">
                        <label className="text-sm mb-1">Mínimo:</label>
                        <input
                            type="number"
                            value={range.min}
                            onChange={(e) => setRange({ ...range, min: e.target.value })}
                            className="px-3 py-2 rounded-lg text-black w-40"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm mb-1">Máximo:</label>
                        <input
                            type="number"
                            value={range.max}
                            onChange={(e) => setRange({ ...range, max: e.target.value })}
                            className="px-3 py-2 rounded-lg text-black w-40"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRangeDraw}
                        className="bg-[#4A86E8] hover:bg-[#3B76D4] px-4 py-2 rounded-lg text-white font-semibold"
                    >
                        Sortear Número
                    </button>
                </div>
            )}

            {formType === "list" && (
                <div className="flex">
                    <div className="w-1/2">
                        <label className="text-md font-semibold block mb-2">Lista de Itens:</label>
                        <div className="overflow-y-auto h-[200px]">
                            <div className="h-fit w-full flex flex-wrap gap-2 justify-start">
                                {list.map((item, index) => (
                                    <div key={index} className="flex items-center bg-white rounded-lg w-[32%]">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => handleListChange(index, e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-lg text-black"
                                            placeholder={`Item ${index + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeListItem(index)}
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
                            onClick={addListItem}
                            className="bg-[#4A86E8] hover:bg-[#3B76D4] px-4 py-2 rounded-lg text-white text-sm mt-4"
                        >
                            + Adicionar item
                        </button>
                        <button
                            type="button"
                            onClick={() => setList([""])}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm mt-2 ml-2"
                        >
                            Limpar todos
                        </button>
                    </div>

                    <div className="w-1/2">
                        {list.filter((i) => i.trim()).length >= 2 && (
                            <div className="mt-4">
                                <SpinningWheel
                                    items={list.filter((item) => item.trim() !== "")}
                                    onFinish={(winner) => {
                                        setSelectedResult(winner);
                                        onSubmit(winner);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {formType === "arquivo" && (
                <div className="">
                    <div className="grid grid-cols-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-[#4A86E8] hover:bg-[#3B76D4] px-1 py-1 rounded-lg text-white text-sm"
                        >
                            Selecione o seu Arquivo
                        </button>
                    </div>

                    <input
                        type="file"
                        accept=".txt, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />

                    {arquivoItems.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-sm text-white mt-2">
                                <div className="">
                                    {arquivoItems.length} itens carregados.
                                </div>
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
                                <button
                                    type="button"
                                    onClick={() => setArquivoItems([])}
                                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm mt-2 ml-2"
                                >
                                    Limpar todos
                                </button>
                            </div>

                            <div className="mt-1">
                                <SpinningWheel
                                    items={arquivoItems}
                                    onFinish={(winner) => {
                                        setSelectedResult(winner);
                                        onSubmit(winner);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </form>
    );
};

export default DynamicForm;
