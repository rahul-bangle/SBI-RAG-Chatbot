import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { parseWeeklyNote } from '../utils/data_parser';
import './PulseDashboard.css';

const PulseInsights = () => {
  const [data, setData] = useState({ themes: [], quotes: [], actions: [] });
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    fetch('/weekly_pulse.md')
      .then(res => res.text())
      .then(text => {
        const parsed = parseWeeklyNote(text);
        setData(parsed);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch pulse data:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && data.themes.length > 0) {
      const ctx = gsap.context(() => {
        gsap.to('.pulse-card', { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          stagger: 0.15, 
          ease: 'power3.out',
          delay: 0.1
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-groww-teal font-bold text-xl">Loading Insights...</div>
      </div>
    );
  }

  return (
    <div className="pulse-dashboard" ref={containerRef}>
      <header className="pulse-header">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-groww-teal rounded-xl flex items-center justify-center shadow-lg shadow-groww-teal/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <span className="text-groww-teal font-bold tracking-widest uppercase text-xs">Product Pulse</span>
        </div>
        <h1>Growth Insights</h1>
        <p>User feedback patterns from SBI Mutual Fund App Reviews</p>
      </header>

      <main>
        <div className="pulse-grid">
          {data.themes.map((theme, i) => (
            <div key={i} className="pulse-card">
              <span className="pulse-tag">High Signal</span>
              <h3>{theme.title}</h3>
              <p>{theme.summary}</p>
            </div>
          ))}
        </div>

        <h2 className="pulse-section-title">Recommended Actions</h2>
        <div className="action-cards">
          {data.actions.map((action, i) => (
            <div key={i} className="action-card">
              <h4>Objective {i + 1}</h4>
              <p>{action}</p>
            </div>
          ))}
        </div>

        <h2 className="pulse-section-title">User Voice</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
            {data.quotes.map((quote, i) => (
                <div key={i} className="bg-groww-gray p-8 rounded-2xl border border-[#EBEBF0] relative">
                    <span className="absolute top-4 left-4 text-4xl text-groww-teal/20 font-serif">"</span>
                    <p className="text-groww-dark font-medium italic relative z-10">{quote}</p>
                </div>
            ))}
        </div>
      </main>

      <button className="pulse-fab" onClick={() => setPanelOpen(true)}>
        <span className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            Action & Loop
        </span>
      </button>

      <div className={`pulse-panel ${isPanelOpen ? 'active' : ''}`}>
        <div className="flex items-center justify-between mb-8">
            <h2 className="m-0">Action Hub</h2>
            <button onClick={() => setPanelOpen(false)} className="text-groww-text-muted hover:text-groww-dark transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        <p className="text-groww-text-muted mb-6">AI-generated email draft for the product team based on these insights.</p>
        <div className="pulse-email-box">
{`Subject: Weekly Pulse: SBI MF User Insights

Hi Team,

Based on our latest review analysis, here are the key themes:
${data.themes.map(t => `- ${t.title}`).join('\n')}

Immediate Actions Recommended:
${data.actions.map((a, i) => `${i+1}. ${a}`).join('\n')}

Full report available in the Pulse dashboard.

Best,
Insights Engine`}
        </div>
        <button className="close-pulse-panel" onClick={() => setPanelOpen(false)}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PulseInsights;
