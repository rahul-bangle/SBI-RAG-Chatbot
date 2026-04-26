import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Menu, X, Globe, User } from 'lucide-react';
import API_BASE_URL from '../api';

const Navbar = ({ onNavigate }) => {
  const [status, setStatus] = useState({ online: false, text: 'Connecting...' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/status`);
        if (res.data.status === 'online') {
            setStatus({ online: true, text: 'RAG Engine Online' });
        } else {
            setStatus({ online: false, text: 'Degraded — DB Issue' });
        }
      } catch (err) {
        setStatus({ online: false, text: 'Engine Offline' });
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Pulse every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-[60] bg-white/90 backdrop-blur-md border-b border-[#EBEBF0] px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-10">
          <div onClick={() => onNavigate('home')} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-groww-teal bg-white">
              <span className="text-groww-teal font-bold text-xs uppercase">S</span>
            </div>
            <span className="text-groww-dark font-bold tracking-tight text-lg md:text-xl">SBI MF</span>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-groww-text-muted">
            <a href="#" className="hover:text-groww-teal transition-colors">SBI Small Cap</a>
            <a href="#" className="hover:text-groww-teal transition-colors">SBI Bluechip</a>
            <a href="#" className="hover:text-groww-teal transition-colors">Large & Midcap</a>
            <button onClick={() => onNavigate('pulse')} className="hover:text-groww-teal transition-colors">Pulse</button>
            <a href="#" className="hover:text-groww-teal transition-colors underline decoration-groww-teal decoration-2 underline-offset-8">Assistant</a>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Search funds..." className="bg-groww-gray text-sm rounded-lg pl-10 pr-4 py-2.5 w-[240px] lg:w-[320px] focus:outline-none focus:ring-1 focus:ring-groww-teal transition-all" readOnly/>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-[#F5F5F7] px-3 py-1.5 rounded-full border border-black/5">
              <div className={`w-1.5 h-1.5 rounded-full ${status.online ? 'bg-groww-teal animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{status.text}</span>
          </div>

          <button className="hidden sm:block bg-groww-teal hover:bg-[#00B889] text-white px-5 py-2 rounded hover:scale-[1.02] transform transition-all font-bold text-[13px] uppercase tracking-wide">
            Login
          </button>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-groww-dark hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="pt-24 px-6 flex flex-col gap-8">
            <div className="flex flex-col gap-6 text-xl font-bold text-groww-dark">
                <a href="#" onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} className="hover:text-groww-teal">Home</a>
                <a href="#" className="hover:text-groww-teal">SBI Small Cap</a>
                <a href="#" className="hover:text-groww-teal">SBI Bluechip</a>
                <a href="#" className="hover:text-groww-teal">Large & Midcap</a>
                <a href="#" onClick={() => { onNavigate('pulse'); setIsMenuOpen(false); }} className="hover:text-groww-teal">Pulse</a>
                <a href="#" className="text-groww-teal">Assistant</a>
            </div>

            <hr className="border-gray-100" />

            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                    <Globe size={20} className="text-gray-400" />
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Status</p>
                        <p className="text-sm font-bold text-groww-dark">{status.text}</p>
                    </div>
               </div>
               
               <button className="w-full bg-groww-teal text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                 <User size={18} /> Login / Register
               </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
