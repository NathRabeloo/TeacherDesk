"use client";

import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Task = {
  id: number;
  text: string;
  done: boolean;
};

export function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    const trimmedTask = newTask.trim();
    if (!trimmedTask) return;

    const alreadyExists = tasks.some(
      (task) => task.text.toLowerCase() === trimmedTask.toLowerCase()
    );
    if (alreadyExists) return;

    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text: trimmedTask, done: false },
    ]);
    setNewTask("");
  };

  const toggleTaskDone = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const clearCompletedTasks = () =>
    setTasks((prev) => prev.filter((task) => !task.done));

  const completedTasks = tasks.filter((t) => t.done);

  return (
    <CardContent className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Tarefas</h2>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Nova tarefa"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <Button
          onClick={addTask}
          className="bg-blue-800 hover:bg-blue-900 text-white"
        >
          Adicionar
        </Button>
        <Button
          onClick={clearCompletedTasks}
          className="bg-gray-800 hover:bg-gray-700 text-white"
          disabled={completedTasks.length === 0}
        >
          Limpar concluídas
        </Button>
      </div>

      <ul className="space-y-3 max-h-96 overflow-y-auto">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-3">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.done}
              onCheckedChange={() => toggleTaskDone(task.id)}
            />
            <Label
              htmlFor={`task-${task.id}`}
              className={`text-sm ${
                task.done ? "line-through text-gray-500" : ""
              }`}
            >
              {task.text}
            </Label>
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="text-center text-gray-500 italic">
            Nenhuma tarefa pendente
          </li>
        )}
      </ul>
    </CardContent>
  );
}
