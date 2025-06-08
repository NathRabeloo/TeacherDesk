"use client";

import React from "react";
import { Progress } from "@/components/ui/progress"; // Assumindo que você está usando o componente Progress do shadcn/ui

type ProgressBarProps = {
  value: number; // Valor em porcentagem (0-100)
  className?: string; // Para passar classes de estilo adicionais
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, className }) => {
  return (
    <div className={className}>
      <Progress value={value} className="h-2" />
    </div>
  );
};


