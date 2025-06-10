'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DisciplinaLista from "@/app/header/perfil/_components/DisciplinaLista";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { FaUser, FaCog, FaEdit } from "react-icons/fa";

const AVATARS = ['masc1', 'masc2', 'masc3', 'fem1', 'fem2', 'fem3'];
const AVATAR_PADRAO = 'fem1';

export default function MeuPerfil() {
  const [user, setUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [avatarSelecionado, setAvatarSelecionado] = useState<string>(AVATAR_PADRAO); // inicializado com padrão
  const router = useRouter();

  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/sign-in");
      } else {
        setUser(data.user);

        // Busca o avatar atual na tabela AvatarUsers
        const { data: avatarData, error: avatarError } = await supabase
          .from("AvatarUsers")
          .select("avatar")
          .eq("user_id", data.user.id)
          .single();

        if (avatarError && avatarError.code !== "PGRST116") {
          console.error("Erro ao buscar avatar:", avatarError.message);
          setAvatarSelecionado(AVATAR_PADRAO);
        } else {
          setAvatarSelecionado(avatarData?.avatar ?? AVATAR_PADRAO);
        }
      }
    }

    fetchUser();
  }, [router, supabase]);

  const salvarAvatar = async () => {
    if (!avatarSelecionado || !user) {
      console.warn("Avatar ou user ausente:", avatarSelecionado, user);
      return;
    }

    const { data, error } = await supabase
      .from("AvatarUsers")
      .upsert(
        { avatar: avatarSelecionado, user_id: user.id },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error("Erro ao salvar avatar:", error);
    } else {
      console.log("Avatar salvo com sucesso:", data);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Card de Perfil */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                <FaUser className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Informações Pessoais
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                  Seus dados e configurações de conta
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <Card className="border-2 border-gray-200 dark:border-gray-600 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <img
                        src={avatarSelecionado ? `/assets/Avatar/${avatarSelecionado}.png` : "/assets/Avatar/default.png"}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-lg"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-full shadow-lg">
                        <FaEdit className="text-white text-sm" />
                      </div>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                      onClick={() => setModalOpen(true)}
                    >
                      <FaCog className="mr-2" />
                      Alterar Avatar
                    </Button>
                  </div>

                  <div className="flex-1 space-y-6 text-center lg:text-left">
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {user.user_metadata?.name ?? "Nome não informado"}
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">
                          ID da Conta
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-mono break-all">
                          {user.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="p-8">
        <DisciplinaLista userId={user.id} />
      </div>

      {/* Modal de Seleção de Avatar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 -mx-6 -mt-6 mb-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                <FaUser className="text-white text-xl" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Escolha seu Avatar
                </DialogTitle>
                <DialogDescription className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Selecione um avatar que represente você
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-6 p-4">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setAvatarSelecionado(avatar)}
                className={`group relative rounded-2xl border-4 transition-all duration-200 focus:outline-none hover:scale-105 ${avatarSelecionado === avatar
                  ? "border-purple-500 shadow-lg shadow-purple-500/25"
                  : "border-transparent hover:border-purple-300 hover:shadow-lg"
                  }`}
              >
                <img
                  src={`/assets/Avatar/${avatar}.png`}
                  alt={`Avatar ${avatar}`}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                {avatarSelecionado === avatar && (
                  <div className="absolute -top-2 -right-2 bg-purple-500 p-1 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <DialogFooter className="flex justify-end gap-3 px-6 py-4 -mx-6 -mb-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="px-6 py-2 text-lg font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-600"
              >
                Cancelar
              </Button>
            </DialogClose>

            <DialogClose asChild>
              <Button
                onClick={salvarAvatar}
                disabled={!avatarSelecionado}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Confirmar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}