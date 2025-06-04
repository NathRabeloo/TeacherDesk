// "use client";

import Header from "../_components/Header";
import { createClient } from "@/lib/utils/supabase/server";
import { redirect } from 'next/navigation';
import Grid from "../_components/Grid";

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // ✅ Puxar avatar do banco
  const { data: avatarData, error: avatarError } = await supabase
    .from("AvatarUsers")
    .select("avatar")
    .eq("user_id", user.id)
    .single();

  if (avatarError && avatarError.code !== "PGRST116") {
    console.error("Erro ao buscar avatar:", avatarError.message);
  }

  const avatarSelecionado = avatarData?.avatar ?? "default";

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const userName = user.user_metadata.name;

  return (
    <div className="">
      <Header
        date={currentDate}
        title={`Bem-vindo, ${userName}!`}
        buttonText="Tutorial TeacherDesk →"
        buttonLink="/home/tutorial"
        desktopImageLeft={`/assets/Avatar/${avatarSelecionado}.png`}
        mobileImage={`/assets/Avatar/${avatarSelecionado}.png`}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="h-[calc(100vh-240px)]">
          <Grid />
        </div>
      </div>
    </div>
  );
}