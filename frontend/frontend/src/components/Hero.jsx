import React from 'react';

const Hero = () => {
  return (
    <section className="pt-32 md:pt-40 pb-16 md:pb-24 px-6 flex flex-col items-center text-center">
      <div className="bg-green-50 text-[#10B981] text-[12px] md:text-[13px] font-bold px-4 py-1.5 rounded-full border border-green-100 mb-6 md:mb-8 flex items-center gap-2 uppercase tracking-wide">
        <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse"></div>
        Live — Updated daily from sbimf.com
      </div>
      
      <h1 className="apple-headline text-4xl sm:text-5xl md:text-[72px] lg:text-[84px] max-w-5xl mb-6 text-groww-dark leading-[1.1] tracking-tight">
        Ask anything about <br className="hidden sm:block" />
        <span className="text-groww-teal">SBI Mutual Funds</span>
      </h1>
      
      <p className="text-groww-text-muted text-base md:text-xl max-w-2xl mb-10 md:mb-14 leading-relaxed font-medium">
        Get instant, cited answers from official scheme documents. 
        Powered by retrieval-augmented generation across factsheets, SIDs, KIMs & scheme pages.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-16 md:gap-32 mt-4 px-4 w-full max-w-4xl">
        <div className="flex flex-col items-center sm:items-start p-6 sm:p-0 bg-gray-50/50 sm:bg-transparent rounded-2xl sm:rounded-none">
            <span className="text-4xl md:text-5xl font-bold text-groww-dark mb-1">4</span>
            <span className="text-[10px] md:text-xs text-groww-text-muted font-bold uppercase tracking-[0.2em]">Schemes Covered</span>
        </div>
        <div className="flex flex-col items-center sm:items-start p-6 sm:p-0 bg-gray-50/50 sm:bg-transparent rounded-2xl sm:rounded-none">
            <span className="text-4xl md:text-5xl font-bold text-groww-dark mb-1">2,916</span>
            <span className="text-[10px] md:text-xs text-groww-text-muted font-bold uppercase tracking-[0.2em]">Knowledge chunks</span>
        </div>
        <div className="flex flex-col items-center sm:items-start p-6 sm:p-0 bg-gray-50/50 sm:bg-transparent rounded-2xl sm:rounded-none">
            <span className="text-4xl md:text-5xl font-bold text-groww-dark mb-1">19</span>
            <span className="text-[10px] md:text-xs text-groww-text-muted font-bold uppercase tracking-[0.2em]">Official sources</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
