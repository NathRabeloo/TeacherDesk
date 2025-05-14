"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import DynamicForm from "../../_components/DynamicForm";

interface Item {
    name: string;
    icon: JSX.Element;
    route: string;
    description: string;
}

const Sorteador = () => {
    const router = useRouter();
    const [formType, setFormType] = useState<"range" | "list" | "arquivo">("range");

    return (
        <div className="flex flex-col h-screen font-sans bg-gray-100 dark:bg-dark-primary">
            <div className="flex flex-1">

                <div className="flex flex-col flex-1">
                    <div className="flex flex-col flex-1 gap-4 p-6">
                        <div className="ml-4">

                        </div>

                        <div className="mb-2">

                        </div>

                        {/* Botão de alternância de tipo de formulário */}
                        <div className="mb-4 flex gap-4 items-center">
                            <button
                                onClick={() => setFormType("range")}
                                className={`px-4 py-2 rounded-lg font-semibold transition ${formType === "range"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-blue-600 border border-blue-600"
                                    }`}
                            >
                                Sorteio por Números
                            </button>

                            <button
                                onClick={() => setFormType("list")}
                                className={`px-4 py-2 rounded-lg font-semibold transition ${formType === "list"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-blue-600 border border-blue-600"
                                    }`}
                            >
                                Sorteio por Lista
                            </button>

                            <button
                                onClick={() => setFormType("arquivo")}
                                className={`px-4 py-2 rounded-lg font-semibold transition ${formType === "arquivo"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-blue-600 border border-blue-600"
                                    }`}
                            >
                                Sorteio com Base em Arquivo
                            </button>

                        </div>

                        <div>
                            <DynamicForm
                                formType={formType}
                                onSubmit={(data) => {
                                    console.log("Dados enviados:", data);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sorteador;
