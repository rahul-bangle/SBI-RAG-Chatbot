import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturesBar from './components/FeaturesBar';
import SchemeGrid from './components/SchemeGrid';
import FloatingAssistant from './components/FloatingAssistant';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Hero />
        <FeaturesBar />
        <SchemeGrid />
      </main>

      <footer className="bg-groww-gray border-t border-[#EBEBF0] py-12 px-6 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center border-2 border-groww-teal rounded-full bg-white">
                    <span className="text-groww-teal font-bold text-xs uppercase">S</span>
                </div>
                <span className="text-groww-dark font-semibold text-lg tracking-tight">SBI MF</span>
            </div>
            
            <p className="max-w-3xl text-center text-xs md:text-[13px] text-groww-text-muted leading-relaxed font-medium px-4">
                This chatbot provides factual information only from official SBI Mutual Fund sources. It does not provide investment advice, recommendations, or performance comparisons. For investment guidance, consult a SEBI registered financial advisor.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-[11px] font-bold text-groww-text-muted uppercase tracking-widest">
                <a href="https://www.sbimf.com" target="_blank" className="hover:text-groww-teal transition-colors">sbimf.com</a>
                <a href="#" className="hover:text-groww-teal transition-colors">Mutual Funds Sahi Hai</a>
                <span className="opacity-50">Built by Manav · 2026</span>
            </div>
        </div>
      </footer>

      <FloatingAssistant />
    </div>
  );
}

export default App;
