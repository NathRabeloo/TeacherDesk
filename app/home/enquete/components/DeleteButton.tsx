// components/DeleteButton.tsx - Componente para deletar enquetes
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaTrash } from "react-icons/fa";

interface DeleteButtonProps {
  enqueteId: string;
  enqueteTitulo?: string;
  onDelete?: () => void;
  label?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export default function DeleteButton({
  enqueteId,
  enqueteTitulo = "esta enquete",
  onDelete,
  label = "Excluir",
  className = "",
  variant = "destructive"
}: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    // Validação do enqueteId
    if (!enqueteId || enqueteId.trim() === "") {
      alert("ID da enquete não fornecido ou inválido");
      console.error("DeleteButton: enqueteId inválido:", enqueteId);
      return;
    }

    // Confirmação antes de deletar
    const confirmacao = window.confirm(
      `Tem certeza que deseja excluir ${enqueteTitulo}? Esta ação não pode ser desfeita.`
    );

    if (!confirmacao) {
      return;
    }

    setLoading(true);
    try {
      console.log("Deletando enquete com ID:", enqueteId);
      
      const response = await fetch(`/api/enquete/deletar?enqueteId=${encodeURIComponent(enqueteId)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Resposta da API:", data);

      if (data.error) {
        alert(`Erro ao excluir enquete: ${data.error}`);
        return;
      }

      if (data.success) {
        alert("Enquete excluída com sucesso!");
        console.log("Enquete deletada com sucesso");
        
        // Chama callback se fornecido (para atualizar lista, etc.)
        if (onDelete) {
          onDelete();
        }
      } else {
        alert("Resposta da API não contém confirmação de sucesso");
      }
    } catch (error) {
      console.error("Erro ao excluir enquete:", error);
      alert(`Erro inesperado ao excluir enquete: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={loading || !enqueteId}
      variant={variant}
      className={className}
    >
      <FaTrash className={label ? "mr-2" : ""} />
      {loading ? "Excluindo..." : label}
    </Button>
  );
}

