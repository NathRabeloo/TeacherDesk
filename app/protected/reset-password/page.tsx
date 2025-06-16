'use client';

import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export default function ResetPassword({ searchParams }: { searchParams: Message }) {
  return (
    <div className="w-screen h-screen flex flex-col lg:flex-row">
      
      {/* Imagem - 60% */}
      <div className="hidden lg:block w-3/5 h-full relative">
        <Image
          src="/background-fatec.jpg"
          alt="Fatec Sorocaba"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Formulário - 40% */}
      <div 
        className="w-full lg:w-2/5 h-full flex items-center justify-center px-6"
        style={{ 
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center', 
          alignItems: 'center',    
          height: '100vh',
          background: 'linear-gradient(to right, #e6f0ff, #cce0ff)',
          fontFamily: 'Segoe UI, sans-serif',
          color: '#1e1e2f',
          padding: '0 5%',
          overflow: 'hidden',
          zIndex: 10 
        }}
      >
        {/* Blur decorativo */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '400px',
          height: '400px',
          backgroundColor: '#ff8c00',
          filter: 'blur(100px)',
          opacity: 0.3,
          zIndex: 0,
          borderRadius: '50%'
        }} />
        
        {/* Bolhas decorativas */}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            bottom: `${Math.random() * 80}%`,
            left: `${Math.random() * 100}%`,
            width: `${20 + Math.random() * 40}px`,
            height: `${20 + Math.random() * 40}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            animation: `float ${10 + Math.random() * 5}s ease-in-out infinite`,
            zIndex: 0
          }} />
        ))}

        <div className="w-full max-w-md space-y-6 relative z-20"> 
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/teacherdesk-logo.png"
              alt="Teacher Desk Logo"
              width={250}
              height={50}
              priority
            />
          </div>

          {/* Título */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-800">Redefinir Senha</h1>
            <p className="text-gray-600 text-sm mt-1">
              Digite sua nova senha abaixo.
            </p>
          </div>

          <form className="space-y-5" action={resetPasswordAction}>
            <div>
              <Label htmlFor="password" className="text-sm text-gray-700">Nova Senha</Label>
              <Input 
                className="bg-white"
                id="password"
                name="password"
                type="password"
                placeholder="Digite sua nova senha"
                minLength={6}
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm text-gray-700">Confirmar Nova Senha</Label>
              <Input 
                className="bg-white"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirme sua nova senha"
                minLength={6}
                required
              />
            </div>

            <SubmitButton className="w-full bg-blue-700 hover:bg-blue-800 text-white" pendingText="Atualizando...">
              Atualizar Senha
            </SubmitButton>

            <p className="text-center text-sm text-gray-600">
              Lembrou da senha?{" "}
              <Link href="/sign-in" className="text-blue-600 hover:underline">
                Faça login
              </Link>
            </p>

            <FormMessage message={searchParams} />
          </form>
        </div>
      </div>
    </div>
  );
}

