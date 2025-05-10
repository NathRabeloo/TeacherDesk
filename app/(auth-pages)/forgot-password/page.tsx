'use client';

import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPassword({ searchParams }: { searchParams: Message }) {
  return (
    <div
      className="w-screen h-screen bg-cover bg-center flex items-start justify-between px-10 pt-16"
      style={{ backgroundImage: "url('/background-fatec.jpg')" }}
    >
      {/* Texto à esquerda */}
      <div className="text-white max-w-md mt-4">
        <h1 className="text-4xl font-bold mb-2">Recuperar Senha</h1>
        <p className="text-lg">
          Informe seu e-mail <br /> para redefinir sua senha.
        </p>
      </div>

      {/* Card de recuperação */}
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
            <Label htmlFor="email" className="text-white">E-mail</Label>
            <Input name="email" placeholder="you@example.com" required className="bg-white text-black" />
          </div>

          <SubmitButton formAction={forgotPasswordAction}>
            Redefinir Senha
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
