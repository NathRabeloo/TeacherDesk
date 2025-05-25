'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DisciplinaLista from "@/app/header/perfil/_components/DisciplinaLista";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const AVATARS = [
  "/assets/Avatar/Avatar1.JPG",
  "/assets/Avatar/Avatar2.JPG",
  "/assets/Avatar/Avatar3.JPG",
  "/assets/Avatar/Avatar4.JPG",
  "/assets/Avatar/Avatar5.JPG",
  "/assets/Avatar/avatar_ruiva.png",
];

export default function MeuPerfil() {
  const [user, setUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [avatarSelecionado, setAvatarSelecionado] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/sign-in");
      } else {
        setUser(data.user);
        const { data: profile } = await supabase
          .from("users")
          .select("avatar_url")
          .eq("id", data.user.id)
          .single();
        setAvatarSelecionado(profile?.avatar_url ?? null);
      }
    }
    fetchUser();
  }, [router, supabase]);

  const salvarAvatar = async () => {
    if (!avatarSelecionado || !user) return;

    const { error } = await supabase
      .from("users")
      .update({ avatar_url: avatarSelecionado })
      .eq("id", user.id);

    if (error) {
      console.error("Erro ao salvar avatar:", error.message);
    } else {
      // Fechamento da modal via DialogClose automático
    }
  };

  if (!user) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[var(--background)] overflow-hidden text-gray-900 dark:text-[var(--foreground)]">
      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-6">
        <Card className="p-4 bg-white dark:bg-[var(--card)] text-black dark:text-[var(--card-foreground)]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={avatarSelecionado ?? "/avatars/default.png"}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover bg-gray-300 dark:bg-gray-700"
            />

            <div className="flex-1 space-y-1 text-center md:text-left">
              <h2 className="text-xl font-bold">{user.user_metadata?.name ?? "Nome não informado"}</h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">ID: {user.id}</p>
            </div>

            <Button
              variant="default"
              className="gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-foreground)] hover:text-[var(--primary)] transition-colors"
              onClick={() => setModalOpen(true)}
            >
              Configurações
            </Button>
          </div>
        </Card>

        <DisciplinaLista userId={user.id} />

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="bg-white dark:bg-[var(--card)] text-black dark:text-[var(--card-foreground)] max-w-lg">
            <DialogHeader>
              <DialogTitle>Escolha seu Avatar</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-5 gap-4 p-4">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setAvatarSelecionado(avatar)}
                  className={`rounded-full border-4 transition-colors focus:outline-none ${
                    avatarSelecionado === avatar
                      ? "border-[var(--primary)]"
                      : "border-transparent hover:border-[var(--primary)]"
                  }`}
                >
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </button>
              ))}
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)]"
                >
                  Cancelar
                </Button>
              </DialogClose>

              <DialogClose asChild>
                <Button
                  onClick={salvarAvatar}
                  disabled={!avatarSelecionado}
                  className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110"
                >
                  Confirmar
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}








