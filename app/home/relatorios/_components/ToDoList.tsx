"use client";

import React, { useState, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaTasks, FaPlus, FaTrash, FaCheckCircle, FaListUl, FaClock } from "react-icons/fa";

import { carregarTarefas, adicionarTarefa, atualizarStatusTarefa, removerTarefa } from "../../../actions";

type Task = {
  id: string;       // UUID do supabase
  titulo: string;   // título da tarefa
  concluida: boolean;  // concluído ou não
  created_at: string; 
};

export function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  // Carrega as tarefas do banco ao montar
  useEffect(() => {
    async function load() {
      setLoading(true);
      const tarefas = await carregarTarefas();
      setTasks(tarefas);
      setLoading(false);
    }
    load();
  }, []);

  // Adiciona nova tarefa no banco e atualiza estado
  const addTask = async () => {
    const trimmedTask = newTask.trim();
    if (!trimmedTask) return;

    const alreadyExists = tasks.some(
      (task) => task.titulo.toLowerCase() === trimmedTask.toLowerCase()
    );
    if (alreadyExists) return;

    const novaTarefa = await adicionarTarefa(trimmedTask);
    if (novaTarefa) {
      setTasks((prev) => [...prev, novaTarefa]);
      setNewTask("");
    }
  };

  // Alterna status no banco e atualiza localmente
  const toggleTaskDone = async (id: string) => {
    const tarefa = tasks.find(t => t.id === id);
    if (!tarefa) return;

    const updated = await atualizarStatusTarefa(id, !tarefa.concluida);
    if (updated) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, concluida: updated.concluida } : task
        )
      );
    }
  };

  // Remove a tarefa do banco e do estado local
  const deleteTask = async (id: string) => {
    await removerTarefa(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // Limpa todas as tarefas concluídas
  const clearCompletedTasks = async () => {
    const completed = tasks.filter(t => t.concluida);
    for (const t of completed) {
      await removerTarefa(t.id);
    }
    setTasks((prev) => prev.filter(t => !t.concluida));
  };

  const completedTasks = tasks.filter(t => t.concluida);
  const pendingTasks = tasks.filter(t => !t.concluida);

  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const dateStr = date.toLocaleDateString('pt-BR');
      const timeStr = date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return { dateStr, timeStr };
    } catch {
      return { dateStr: "Data inválida", timeStr: "" };
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-400">
        Carregando tarefas...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
              <FaTasks className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Lista de Tarefas
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Organize suas atividades diárias
              </p>
            </div>
          </div>
          
          {/* Estatísticas Rápidas */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full mb-1">
                <FaListUl className="text-blue-600 dark:text-blue-400 text-sm" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{tasks.length}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full mb-1">
                <FaCheckCircle className="text-green-600 dark:text-green-400 text-sm" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{completedTasks.length}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full mb-1">
                <FaClock className="text-orange-600 dark:text-orange-400 text-sm" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{pendingTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Input Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-600">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Digite uma nova tarefa..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                className="border-2 border-gray-300 dark:border-gray-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-4 py-3 text-base"
              />
            </div>
            <Button
              onClick={addTask}
              disabled={!newTask.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaPlus className="text-sm" />
              Adicionar
            </Button>
          </div>
          
          {completedTasks.length > 0 && (
            <div className="mt-3 flex justify-end">
              <Button
                onClick={clearCompletedTasks}
                variant="outline"
                className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-lg flex items-center gap-2"
              >
                <FaTrash className="text-sm" />
                Limpar Concluídas ({completedTasks.length})
              </Button>
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTasks className="text-3xl text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Nenhuma tarefa cadastrada
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Adicione uma nova tarefa para começar a organizar suas atividades
              </p>
            </div>
          ) : (
            <>
              {/* Tarefas Pendentes */}
              {pendingTasks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <FaClock className="text-orange-500" />
                    Pendentes ({pendingTasks.length})
                  </h3>
                  {pendingTasks.map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={toggleTaskDone}
                      onDelete={deleteTask}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}

              {/* Tarefas Concluídas */}
              {completedTasks.length > 0 && (
                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    Concluídas ({completedTasks.length})
                  </h3>
                  {completedTasks.map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={toggleTaskDone}
                      onDelete={deleteTask}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </div>
  );
}

// Componente para cada item da tarefa
function TaskItem({ 
  task, 
  onToggle, 
  onDelete,
  formatDate
}: { 
  task: Task; 
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (date: string) => { dateStr: string; timeStr: string };
}) {
  const { dateStr, timeStr } = formatDate(task.created_at);
  
  return (
    <div className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
      task.concluida
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600' 
        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md'
    }`}>
      <Checkbox
        id={`task-${task.id}`}
        checked={task.concluida}
        onCheckedChange={() => onToggle(task.id)}
        className="w-5 h-5 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
      />
      
      <div className="flex-1 min-w-0">
        <Label
          htmlFor={`task-${task.id}`}
          className={`text-base cursor-pointer block ${
            task.concluida
              ? "line-through text-gray-500 dark:text-gray-400" 
              : "text-gray-900 dark:text-white"
          }`}
        >
          {task.titulo}
        </Label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Criada em {dateStr} {timeStr && `às ${timeStr}`}
        </p>
      </div>
      
      <Button
        onClick={() => onDelete(task.id)}
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg p-2 transition-all duration-200"
      >
        <FaTrash className="text-sm" />
      </Button>
    </div>
  );
}
