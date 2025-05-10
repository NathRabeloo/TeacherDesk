// app/meu-perfil/page.tsx
import { createClient } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import  MenuHeader from "@/app/header/perfil/_components/DisciplinaLista";
import DisciplinaLista from "@/app/header/perfil/_components/DisciplinaLista";

export default async function MeuPerfil() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    return redirect("/sign-in");
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-2">
          <h1 className="text-xl font-bold">Meu Perfil</h1>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Nome:</strong> {user.user_metadata?.name ?? "Não informado"}</p>
          <p><strong>ID:</strong> {user.id}</p>
        </CardContent>
      </Card>

      <DisciplinaLista userId={user.id} />
    </div>
  );
}
