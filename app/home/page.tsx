// "use client";

import Header from "../components/Header";

import { createClient } from "@/lib/utils/supabase/server";
import { redirect } from 'next/navigation';

import Grid from "../components/Grid";

export default async function Home() {

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const userName = user.user_metadata.name;

  return (
    <div  className="max-h-screen">
      <Header
        date={currentDate}
        title={`Bem-vindo, ${userName}!`}
        buttonText="Tutorial TeacherDesk →"
        buttonLink="/home/tutorial"
        desktopImageLeft="/assets/avatar_ruiva.png"
        desktopImageRight="/assets/mesa_professora_ruiva.png"
        mobileImage="/assets/avatar_ruiva.png"
      />
      <Grid/>
    </div>
  );

}