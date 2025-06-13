// components/ExportButton.tsx - Versão corrigida
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaDownload } from "react-icons/fa";

interface ExportButtonProps {
  enqueteId: string;
  label?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export default function ExportButton({
  enqueteId,
  label = "Exportar Resultados",
  className = "",
  variant = "outline"
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    // Validação mais robusta do enqueteId
    if (!enqueteId || enqueteId.trim() === "") {
      alert("ID da enquete não fornecido ou inválido");
      console.error("ExportButton: enqueteId inválido:", enqueteId);
      return;
    }

    setLoading(true);
    try {
      console.log("Exportando enquete com ID:", enqueteId);
      
      const response = await fetch(`/api/enquete/exportar?enqueteId=${encodeURIComponent(enqueteId)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Resposta da API:", data);

      if (data.error) {
        alert(`Erro ao exportar dados: ${data.error}`);
        return;
      }

      if (data.success && data.conteudo) {
        // Criar arquivo de texto e fazer download
        const blob = new Blob([data.conteudo], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `enquete-${enqueteId}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log("Download iniciado com sucesso");
      } else {
        alert("Resposta da API não contém dados válidos");
      }
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      alert(`Erro inesperado ao exportar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={loading || !enqueteId}
      variant={variant}
      className={className}
    >
      <FaDownload className={label ? "mr-2" : ""} />
      {loading ? "Exportando..." : label}
    </Button>
  );
}

// Componente para exportar histórico de enquetes - Versão corrigida
export function ExportHistoryButton({
  label = "Exportar Histórico",
  className = "",
  variant = "outline"
}: Omit<ExportButtonProps, "enqueteId">) {
  const [loading, setLoading] = useState(false);

  const handleExportHistory = async () => {
    setLoading(true);
    try {
      console.log("Iniciando exportação do histórico...");
      
      // Buscar lista de enquetes do usuário
      const listResponse = await fetch("/api/enquete/listar");
      
      if (!listResponse.ok) {
        throw new Error(`Erro ao buscar enquetes: HTTP ${listResponse.status}`);
      }
      
      const listData = await listResponse.json();
      console.log("Dados das enquetes:", listData);

      if (listData.error) {
        alert(`Erro ao buscar enquetes: ${listData.error}`);
        return;
      }

      if (!listData.success || !listData.enquetes || listData.enquetes.length === 0) {
        alert("Nenhuma enquete encontrada para exportar");
        return;
      }

      // Gerar conteúdo do histórico
      let conteudo = "HISTÓRICO DE ENQUETES\n";
      conteudo += "====================\n\n";

      // Para cada enquete, buscar detalhes e resultados
      for (let i = 0; i < listData.enquetes.length; i++) {
        const enquete = listData.enquetes[i];
        conteudo += `ENQUETE ${i + 1}\n`;
        conteudo += `---------\n`;
        conteudo += `ID: ${enquete.id}\n`;
        conteudo += `Pergunta: ${enquete.pergunta}\n`;
        conteudo += `Status: ${enquete.ativa ? 'Ativa' : 'Encerrada'}\n`;
        conteudo += `Criada em: ${new Date(enquete.criada_em).toLocaleString('pt-BR')}\n`;
        
        // Buscar resultados se a enquete estiver encerrada
        if (!enquete.ativa) {
          try {
            const resultResponse = await fetch(`/api/enquete/resultados?enqueteId=${enquete.id}`);
            if (resultResponse.ok) {
              const resultData = await resultResponse.json();
              
              if (resultData.success && resultData.resultados) {
                const totalVotos = resultData.resultados.reduce((total: number, opcao: any) => total + opcao.votos, 0);
                conteudo += `Total de votos: ${totalVotos}\n`;
                conteudo += `Resultados:\n`;
                resultData.resultados.forEach((opcao: any, index: number) => {
                  const percentual = totalVotos > 0 ? Math.round((opcao.votos / totalVotos) * 100) : 0;
                  conteudo += `  ${index + 1}. ${opcao.texto}: ${opcao.votos} votos (${percentual}%)\n`;
                });
              }
            } else {
              conteudo += `Erro ao carregar resultados desta enquete\n`;
            }
          } catch (error) {
            console.error(`Erro ao buscar resultados da enquete ${enquete.id}:`, error);
            conteudo += `Erro ao carregar resultados desta enquete\n`;
          }
        } else {
          // Para enquetes ativas, buscar dados básicos
          try {
            const activeResponse = await fetch(`/api/enquete/resultados?enqueteId=${enquete.id}`);
            if (activeResponse.ok) {
              const activeData = await activeResponse.json();
              if (activeData.success && activeData.resultados) {
                const totalVotos = activeData.resultados.reduce((total: number, opcao: any) => total + opcao.votos, 0);
                conteudo += `Total de votos atual: ${totalVotos}\n`;
              }
            }
          } catch (error) {
            console.error(`Erro ao buscar dados da enquete ativa ${enquete.id}:`, error);
          }
        }
        
        conteudo += "\n";
      }

      conteudo += `\nExportado em: ${new Date().toLocaleString('pt-BR')}\n`;

      // Criar arquivo de texto e fazer download
      const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `historico-enquetes-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log("Exportação do histórico concluída com sucesso");
    } catch (error) {
      console.error("Erro ao exportar histórico:", error);
      alert(`Erro inesperado ao exportar histórico: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExportHistory}
      disabled={loading}
      variant={variant}
      className={className}
    >
      <FaDownload className={label ? "mr-2" : ""} />
      {loading ? "Exportando..." : label}
    </Button>
  );
}

