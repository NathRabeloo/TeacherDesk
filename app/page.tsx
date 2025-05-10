"use client";
//Será melhorado pela Nath
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
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif', 
      background: 'linear-gradient(to bottom, #0D47A1, #1976D2)' 
    }}>
      <h1 style={{ 
        color: '#f66b0e', 
        fontSize: '3.5rem', 
        marginBottom: '20px',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' 
      }}>
        Teacher Desk
      </h1>
      <p style={{ 
        textAlign: 'center', 
        marginBottom: '40px', 
        fontSize: '1.5rem', 
        color: '#E3F2FD',
        maxWidth: '600px', 
        lineHeight: '1.5' 
      }}>
        Uma plataforma intuitiva para criar quizzes, enquetes e tutoriais, facilitando a gestão de seus conteúdos. Acesse já para explorar todas as funcionalidades que oferecemos!
      </p>
      <button
        onClick={handleLoginRedirect}
        style={{
          padding: '12px 30px',
          backgroundColor: '#f66b0e',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1.2rem',
          transition: 'background-color 0.3s ease, transform 0.2s ease',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', // Sombra para o botão
          margin: '10px'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#b87333'} // Efeito ao passar o mouse
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f66b0e'} // Volta a cor original
      >
        Sou professor
      </button>
    <div>
    <button
        onClick={handleAlunoRedirect}
        style={{
          padding: '12px 30px',
          backgroundColor: '#7e7c92',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1.2rem',
          transition: 'background-color 0.3s ease, transform 0.2s ease',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)' // Sombra para o botão
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#86571d'} // Efeito ao passar o mouse
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7e7c92'} // Volta a cor original
      >
        Sou aluno
      </button>
    </div>

    </div>
  );
};

export default MainPage;