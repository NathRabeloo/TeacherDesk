"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaRandom } from "react-icons/fa";
import DynamicForm from "@/app/_components/DynamicForm";

type Sorteio = {
    titulo: string;
    descricao: string;
    tipo: "range" | "list" | "arquivo";
};

const sorteios: Sorteio[] = [
    {
        titulo: "Sorteio por Intervalo",
        descricao: "Informe um número mínimo e máximo para sortear.",
        tipo: "range",
    },
    {
        titulo: "Sorteio por Lista",
        descricao: "Digite uma lista de itens e sorteie aleatoriamente.",
        tipo: "list",
    },
    {
        titulo: "Sorteio por Arquivo",
        descricao: "Carregue um arquivo .txt com os itens a serem sorteados.",
        tipo: "arquivo",
    },
];

export default function SorteadorPage() {
    const [selectedTipo, setSelectedTipo] = useState<"range" | "list" | "arquivo" | null>(null);

    const closeModal = () => setSelectedTipo(null);
    const save = () => {
        // Implementar ação de salvar
        console.log("Salvar dados");
        closeModal();
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-center mb-8">Tipos de Sorteio</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sorteios.map((sorteio, index) => (
                    <Dialog key={index} open={selectedTipo === sorteio.tipo} onOpenChange={(open) => !open && closeModal()}>
                        <DialogTrigger asChild>
                            <Card
                                onClick={() => setSelectedTipo(sorteio.tipo)}
                                className="cursor-pointer hover:shadow-lg transition"
                            >
                                <CardContent className="flex flex-col items-center p-6 text-center">
                                    <FaRandom className="text-4xl text-blue-600 mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">{sorteio.titulo}</h3>
                                    <p className="text-gray-600">{sorteio.descricao}</p>
                                </CardContent>
                            </Card>
                        </DialogTrigger>

                        <DialogContent className="max-w-6xl p-8 space-y-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">
                                    {sorteio.titulo}
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    {sorteio.descricao}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <DynamicForm
                                    formType={sorteio.tipo}
                                    onSubmit={(data) => {
                                        console.log("Resultado do sorteio:", data);
                                    }}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="ghost" onClick={closeModal}>
                                    Cancelar
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                ))}
            </div>
        </div>
    );
}
