import React from 'react';
import { Activity, LayoutGrid, Lock, BarChart2, ArrowRight } from 'lucide-react';

const schemes = [
  {
    name: "SBI Large Cap Fund",
    category: "LARGE CAP · EQUITY",
    icon: <Activity size={24} className="text-blue-500" />,
    desc: "Predominantly invests in large-cap companies for long-term capital appreciation with lower volatility.",
    links: {
      factsheet: "https://www.sbimf.com/en-us/equity-schemes/sbi-bluechip-fund",
      sid: "#",
      kim: "#"
    }
  },
  {
    name: "SBI Flexicap Fund",
    category: "FLEXI CAP · EQUITY",
    icon: <LayoutGrid size={24} className="text-emerald-500" />,
    desc: "Dynamically allocates across large, mid & small cap segments based on market conditions.",
    links: {
      factsheet: "https://www.sbimf.com/en-us/equity-schemes/sbi-flexicap-fund",
      sid: "#",
      kim: "#"
    }
  },
  {
    name: "SBI ELSS Tax Saver Fund",
    category: "ELSS · TAX SAVING",
    icon: <Lock size={24} className="text-amber-500" />,
    desc: "Equity-linked savings scheme with 3-year lock-in, eligible for deduction under Section 80C.",
    links: {
      factsheet: "https://www.sbimf.com/en-us/equity-schemes/sbi-long-term-equity-fund",
      sid: "#",
      kim: "#"
    }
  },
  {
    name: "SBI Small Cap Fund",
    category: "SMALL CAP · EQUITY",
    icon: <BarChart2 size={24} className="text-purple-500" />,
    desc: "Targets small-cap stocks for high growth potential. Suited for long-term investors with higher risk appetite.",
    links: {
      factsheet: "https://www.sbimf.com/en-us/equity-schemes/sbi-small-cap-fund",
      sid: "#",
      kim: "#"
    }
  }
];

const SchemeGrid = () => {
  return (
    <section className="py-20 md:py-32 px-4 md:px-6 bg-[#FAFAFB]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
            <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 md:mb-3">Schemes Covered</span>
            <h2 className="apple-headline text-3xl md:text-[40px] mb-4 text-groww-dark leading-tight">Four SBI Mutual Fund schemes, <br className="hidden sm:block" /> fully indexed</h2>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">Each scheme's factsheet, SID, KIM & live scheme page are scraped, chunked, embedded and stored for instant retrieval.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {schemes.map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col">
              <div className="mb-6 flex justify-between items-start">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
                    {s.icon}
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{s.category}</span>
              </div>
              
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">{s.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1 h-20 overflow-hidden line-clamp-3">
                {s.desc}
              </p>

              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6">
                <button className="text-[9px] md:text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 hover:bg-gray-100 transition-colors uppercase tracking-tight">Factsheet</button>
                <button className="text-[9px] md:text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 hover:bg-gray-100 transition-colors uppercase tracking-tight">SID</button>
                <button className="text-[9px] md:text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 hover:bg-gray-100 transition-colors uppercase tracking-tight">KIM</button>
                <button className="text-[9px] md:text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 hover:bg-gray-100 transition-colors uppercase tracking-tightest sm:tracking-tight">Portal</button>
              </div>

              <button className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl text-sbi-navy font-bold text-[13px] group-hover:bg-groww-teal group-hover:text-white transition-all">
                <span>Ask about this fund</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SchemeGrid;
