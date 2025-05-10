'use client';

import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export default function Login({ searchParams }: { searchParams: Message }) {
  return (
    <div
      className="w-screen h-screen bg-cover bg-center flex items-start justify-between px-10 pt-16"
      style={{ backgroundImage: "url('/background-fatec.jpg')" }}
    >
      {/* Texto à esquerda (alinhado mais ao topo) */}
      <div className="text-white max-w-md mt-4">
        <h1 className="text-4xl font-bold mb-2">Olá, professor!</h1>
        <p className="text-lg">
          Faça seu login ou cadastro <br /> para acessar todas funcionalidades.
        </p>
      </div>

      {/* Card de login à direita com mais altura e espaço interno */}
   <div className="bg-blue-500 bg-opacity-90 rounded-xl shadow-lg w-full max-w-md h-[700px] p-8 sm:p-12 text-white flex flex-col justify-center overflow-auto">

        <div className="flex justify-center mb-6">
          <Image
            src="/teacherdesk-logo.png"
            alt="Teacher Desk Logo"
            width={380}
            height={40}
            priority
          />
        </div>

        <form className="flex flex-col gap-6">
          <div>
            <Label htmlFor="email" className="text-white">Usuário</Label>
            <Input
              name="email"
              placeholder="you@example.com"
              required
              className="bg-white text-black"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-white">Senha</Label>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="Sua senha"
              required
              className="bg-white text-black"
            />
              <Link
                href="/forgot-password"
                className="text-sm underline text-white"
              >
                Esqueceu a senha?
              </Link>
          </div>

          <SubmitButton pendingText="Entrando..." formAction={signInAction}>
            Entrar
          </SubmitButton>

          <Link
            href="/sign-up"
            className="block text-center text-white underline text-sm mt-2"
          >
            Criar Conta
          </Link>

          <FormMessage message={searchParams} />
        </form>
      </div>
    </div>
  );
}