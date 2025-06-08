"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Hash, Play, XCircle, CheckCircle } from "lucide-react";
import { Participante, ParticipanteErrors } from "./types";

type ParticipantInfoFormProps = {
  onSubmit: (participante: Participante) => void;
  loading: boolean;
};

export const ParticipantInfoForm: React.FC<ParticipantInfoFormProps> = ({ onSubmit, loading }) => {
  const [participante, setParticipante] = useState<Participante>({ nome: "", ra: "" });
  const [errors, setErrors] = useState<ParticipanteErrors>({});

  const handleRAChange = (value: string) => {
    // Remove caracteres não numéricos
    const numbersOnly = value.replace(/\D/g, '');
    
    // Limita a 13 dígitos
    const limitedValue = numbersOnly.slice(0, 13);
    
    setParticipante(prev => ({ ...prev, ra: limitedValue }));
    
    // Remove erro se o RA estiver válido
    if (errors.ra && /^\d{13}$/.test(limitedValue)) {
      setErrors(prev => ({ ...prev, ra: undefined }));
    }
  };

  const handleNomeChange = (value: string) => {
    // Limita o nome a 30 caracteres
    const limitedValue = value.slice(0, 30);
    
    setParticipante(prev => ({ ...prev, nome: limitedValue }));
    
    // Remove erro se o nome estiver válido
    if (errors.nome && limitedValue.trim()) {
      setErrors(prev => ({ ...prev, nome: undefined }));
    }
  };

  const validarParticipante = () => {
    const newErrors: ParticipanteErrors = {};
    
    if (!participante.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }
    
    if (!participante.ra.trim()) {
      newErrors.ra = "RA é obrigatório";
    } else if (!/^\d{13}$/.test(participante.ra.trim())) {
      newErrors.ra = "RA deve conter exatamente 13 dígitos numéricos";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validarParticipante()) {
      onSubmit(participante);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Informações do Participante</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Preencha seus dados para participar do questionário</p>
      </div>
      <div className="p-8">
        <div className="space-y-6">
          <div>
            <Label htmlFor="nome" className="flex items-center gap-3 mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              <div className="bg-blue-500 p-2 rounded-lg">
                <User className="text-white" size={20} />
              </div>
              Nome Completo
            </Label>
            <Input
              id="nome"
              placeholder="Digite seu nome completo"
              value={participante.nome}
              onChange={(e) => handleNomeChange(e.target.value)}
              className={`text-lg py-4 px-4 rounded-xl border-2 transition-all duration-200 ${
                errors.nome 
                  ? "border-red-500 focus:border-red-600" 
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
              }`}
              maxLength={30}
            />
            {errors.nome && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                <XCircle size={16} />
                {errors.nome}
              </p>
            )}
            {participante.nome && (
              <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
                <CheckCircle className={participante.nome.length < 30 ? "text-green-500" : "text-amber-500"} size={16} />
                {participante.nome.length}/30 caracteres
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="ra" className="flex items-center gap-3 mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              <div className="bg-green-500 p-2 rounded-lg">
                <Hash className="text-white" size={20} />
              </div>
              RA (Registro Acadêmico)
            </Label>
            <Input
              id="ra"
              placeholder="Digite seu RA (13 dígitos)"
              value={participante.ra}
              onChange={(e) => handleRAChange(e.target.value)}
              className={`text-lg py-4 px-4 rounded-xl border-2 transition-all duration-200 ${
                errors.ra 
                  ? "border-red-500 focus:border-red-600" 
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
              }`}
              maxLength={13}
              inputMode="numeric"
            />
            {errors.ra && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                <XCircle size={16} />
                {errors.ra}
              </p>
            )}
            {participante.ra && !errors.ra && (
              <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                {participante.ra.length}/13 dígitos
              </p>
            )}
          </div>

          <div className="pt-6">
            <Button 
              onClick={handleSubmit} 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-8 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Iniciando...
                </>
              ) : (
                <>
                  <Play size={20} />
                  Começar Questionário
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

