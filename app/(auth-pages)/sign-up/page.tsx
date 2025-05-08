'use client';

import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export default function Signup({ searchParams }: { searchParams: Message }) {
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div
      className="w-screen h-screen bg-cover bg-center flex items-start justify-between px-10 pt-16"
      style={{ backgroundImage: "url('/background-fatec.jpg')" }}
    >
      {/* Texto à esquerda */}
      <div className="text-white max-w-md mt-4">
        <h1 className="text-4xl font-bold mb-2">Crie sua conta</h1>
        <p className="text-lg">
          Registre-se para <br /> acessar todas funcionalidades.
        </p>
      </div>

      {/* Card de cadastro */}
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
            <Label htmlFor="name" className="text-white">Nome completo</Label>
            <Input name="name" placeholder="Seu nome completo" required className="bg-white text-black" />
          </div>

          <div>
            <Label htmlFor="email" className="text-white">E-mail</Label>
            <Input name="email" type="email" placeholder="seu@email.com" required className="bg-white text-black" />
          </div>

          <div>
            <Label htmlFor="password" className="text-white">Senha</Label>
            <Input type="password" name="password" placeholder="Sua senha" minLength={6} required className="bg-white text-black" />
          </div>

          <SubmitButton formAction={signUpAction} pendingText="Registrando...">
            Registrar-se
          </SubmitButton>

          <Link href="/sign-in" className="text-sm underline text-white text-center mt-2">
            Já possui conta? Faça login
          </Link>

          <FormMessage message={searchParams} />
        </form>

        
      </div>
    </div>
  );
}
