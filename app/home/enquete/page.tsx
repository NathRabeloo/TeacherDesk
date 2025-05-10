"use client";

import Header from "../../components/Header";

const Home = () => {

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-100 dark:bg-dark-primary">
      <Header 
        date={currentDate} 
        title="Enquetes" 
        buttonText="Criar uma Enquete →" 
        buttonLink="/enquetes"
        mobileImage="/assets/professora_denilce.png" 
      />
      <div className="flex flex-1">
        <div className="flex flex-col flex-1">
          <div className="flex flex-col flex-1 gap-4 p-6">
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;