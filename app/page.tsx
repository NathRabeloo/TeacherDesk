"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

const MainPage = () => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push('/sign-in');
  };

  const handleAlunoRedirect = () => {
    router.push('/aluno');
  };

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(to right, #e6f0ff, #cce0ff)',
      fontFamily: 'Segoe UI, sans-serif',
      color: '#1e1e2f',
      padding: '0 5%',
      overflow: 'hidden'
    }}>
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

      {/* Mancha laranja decorativa */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '0',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(255,140,0,0.3) 0%, transparent 70%)',
        zIndex: 0
      }} />

      {/* Onda inferior */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '120px',
        background: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1440 320\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath fill=\'%23ffffff\' fill-opacity=\'1\' d=\'M0,224L48,197.3C96,171,192,117,288,117.3C384,117,480,171,576,170.7C672,171,768,117,864,90.7C960,64,1056,64,1152,80C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E") no-repeat',
        backgroundSize: 'cover',
        zIndex: 0
      }} />

      {/* Conteúdo principal */}
      <div style={{ maxWidth: '600px', zIndex: 2 }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 'bold',
          color: '#1f3b78',
          marginBottom: '10px'
        }}>
          Teacher Desk
        </h1>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: 500,
          marginBottom: '20px',
          color: '#1e1e2f'
        }}>
          Organize seu conteúdo com praticidade
        </h2>
        <p style={{
          fontSize: '1.1rem',
          lineHeight: '1.6',
          color: '#333',
          marginBottom: '30px'
        }}>
          Crie quizzes, enquetes e tutoriais com uma interface moderna e funcional para a sala de aula.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleLoginRedirect}
            style={{
              padding: '12px 28px',
              backgroundColor: '#1f3b78',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#163062'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1f3b78'}
          >
            Sou professor
          </button>
          <button
          onClick={handleAlunoRedirect}
          style={{
            padding: '10px 20px',
            backgroundColor: '#E3F2FD',
            color: '#0D47A1',
            border: '1px solid #0D47A1',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Acessar bibliografia
        </button>
        </div>
        <footer style={{
          marginTop: '40px',
          fontSize: '0.85rem',
          color: '#777'
        }}>
          © Nathalia Rabelo, 2024. Todos os direitos reservados.
        </footer>
      </div>

      {/* Animação CSS */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MainPage;
