"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaRandom, FaHashtag, FaListUl, FaFileUpload, FaDice, FaGift, FaTrophy } from "react-icons/fa";
import DynamicForm from "@/app/_components/DynamicForm";

type Sorteio = {
    titulo: string;
    descricao: string;
    tipo: "range" | "list" | "arquivo";
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
};

const sorteios: Sorteio[] = [
    {
        titulo: "Sorteio por Intervalo",
        descricao: "Informe um número mínimo e máximo para sortear.",
        tipo: "range",
        icon: FaHashtag,
        gradient: "from-blue-500 to-blue-600"
    },
    {
        titulo: "Sorteio por Lista",
        descricao: "Digite uma lista de itens e sorteie aleatoriamente.",
        tipo: "list",
        icon: FaListUl,
        gradient: "from-green-500 to-green-600"
    },
    {
        titulo: "Sorteio por Arquivo",
        descricao: "Carregue um arquivo com os itens a serem sorteados.",
        tipo: "arquivo",
        icon: FaFileUpload,
        gradient: "from-purple-500 to-purple-600"
    },
];

export default function SorteadorPage() {
    const [selectedTipo, setSelectedTipo] = useState<"range" | "list" | "arquivo" | null>(null);

    const closeModal = () => setSelectedTipo(null);

    const getModalTitle = () => {
        const sorteio = sorteios.find(s => s.tipo === selectedTipo);
        return sorteio?.titulo || "Sorteio";
    };

    const getModalDescription = () => {
        const sorteio = sorteios.find(s => s.tipo === selectedTipo);
        return sorteio?.descricao || "Configure seu sorteio";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            {/* Seção de Conteúdo Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Cabeçalho do Conteúdo */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                                    <FaRandom className="text-white text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Tipos de Sorteio
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                                        Escolha o tipo de sorteio que melhor atende suas necessidades
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid de Cartões de Sorteio */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {sorteios.map((sorteio, index) => {
                                const IconComponent = sorteio.icon;
                                return (
                                    <Dialog key={index} open={selectedTipo === sorteio.tipo} onOpenChange={(open) => !open && closeModal()}>
                                        <DialogTrigger asChild>
                                            <Card
                                                onClick={() => setSelectedTipo(sorteio.tipo)}
                                                className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-800"
                                            >
                                                <CardContent className="flex flex-col items-center p-8 text-center space-y-6">
                                                    <div className={`bg-gradient-to-r ${sorteio.gradient} p-4 rounded-2xl shadow-lg`}>
                                                        <IconComponent className="text-4xl text-white" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                            {sorteio.titulo}
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                                            {sorteio.descricao}
                                                        </p>
                                                    </div>
                                                    <div className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r ${sorteio.gradient} text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200`}>
                                                        Começar Sorteio
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </DialogTrigger>

                                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-2xl">
                                            <DialogHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-3 rounded-xl bg-gradient-to-r ${sorteio.gradient}`}>
                                                        <IconComponent className="text-white text-xl" />
                                                    </div>
                                                    <div>
                                                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                                            {getModalTitle()}
                                                        </DialogTitle>
                                                        <DialogDescription className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                                                            {getModalDescription()}
                                                        </DialogDescription>
                                                    </div>
                                                </div>
                                            </DialogHeader>

                                            <div className="p-8">
                                                <DynamicForm
                                                    formType={sorteio.tipo}
                                                    onSubmit={(data) => {
                                                        console.log("Resultado do sorteio:", data);
                                                    }}
                                                />
                                            </div>

                                            <div className="flex justify-end gap-3 px-8 py-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                                <Button
                                                    variant="ghost"
                                                    onClick={closeModal}
                                                    className="px-6 py-2 text-lg font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-600"
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}