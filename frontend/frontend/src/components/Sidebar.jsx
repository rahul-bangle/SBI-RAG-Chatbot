import React from 'react';
import { ShieldAlert, Activity } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-72 bg-sbi-surface border-r border-white/5 p-6 flex flex-col gap-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          SBI <span className="text-sbi-saffron font-bold text-3xl">Mutual Fund</span>
        </h1>
        <p className="text-xs text-white/50 tracking-widest uppercase mt-1">Fact Assistant v2.0</p>
      </div>

      <div className="flex-1"></div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
         <div className="flex items-center gap-3">
             <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sbi-saffron opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sbi-saffron"></span>
             </div>
             <span className="text-sm font-medium text-white/80 tracking-wide">Live Data Sync</span>
         </div>
      </div>

      <div className="bg-white/5 border border-[#F58220]/20 p-4 rounded-xl text-[13px] text-white/60 leading-relaxed">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert size={16} className="text-sbi-saffron opacity-80" />
          <b className="text-white/80 font-medium">Facts-Only Protocol</b>
        </div>
        I provide precise information from official AMFI & SBI sources. I cannot provide investment advice.
      </div>
    </aside>
  );
};

export default Sidebar;
