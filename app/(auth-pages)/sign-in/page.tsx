
"use client";
import { Message } from "@/components/form-message";
import { signInAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function Login({ searchParams }: { searchParams: Message }) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="w-screen h-screen flex flex-col lg:flex-row relative">
      
    <button
        onClick={handleBackToHome}
        className="absolute top-6 left-6 z-50 group flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm border border-white/30 text-blue-700 hover:text-white hover:bg-blue-600 transition-all duration-300 rounded-full shadow-lg hover:shadow-xl hover:scale-110"
        title="Voltar para página inicial"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform duration-300" />
      </button>

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
            <h1 className="text-2xl font-bold text-blue-800">Bem-vindo, professor!</h1>
            <p className="text-gray-600 text-sm mt-1">
              Faça seu login ou cadastro para acessar todas funcionalidades.
            </p>
          </div>

          <form className="space-y-5" action={signInAction}>
            <div>
              <Label htmlFor="email" className="text-sm text-gray-700">Email</Label>
              <Input
                className=" bg-white"
                id="email"
                name="email"
                type="email"
                placeholder="exemplo@email.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm text-gray-700">Senha</Label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  className=" bg-white pr-10"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remember" className="border-gray-300 rounded" />
              <Label htmlFor="remember" className="text-sm text-gray-700">Lembrar-me</Label>
            </div>

            <SubmitButton className="w-full bg-blue-700 hover:bg-blue-800 text-white" pendingText="Entrando...">
              Entrar
            </SubmitButton>

            <p className="text-center text-sm text-gray-600">
              Ainda não tem uma conta?{" "}
              <Link href="/sign-up" className="text-blue-600 hover:underline">
                Criar Conta
              </Link>
            </p>

            <FormMessage message={searchParams} />
          </form>
        </div>
      </div>
    </div>
  );
}


