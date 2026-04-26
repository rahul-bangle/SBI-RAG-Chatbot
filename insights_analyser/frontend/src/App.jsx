import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import './Dashboard.css';

const App = () => {
  const [isEmailPanelOpen, setEmailPanelOpen] = useState(false);
  const dashboardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.header', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
      gsap.to('.theme-card', { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: 'back.out(1.7)',
        delay: 0.2
      });
      gsap.to('.actions-section', { opacity: 1, duration: 0.8, delay: 0.6 });
    }, dashboardRef);
    
    return () => ctx.revert();
  }, []);

  const themes = [
    {
      title: "Ease of Use",
      summary: "Users appreciate the app's clean interface and ease of tracking mutual funds.",
      quotes: ["Very easy to use and track my mutual funds. The interface is clean."]
    },
    {
      title: "Technical Issues",
      summary: "Significant friction in UPI transactions and KYC verification loops.",
      quotes: ["My KYC has been pending for 2 weeks. Very frustrating.", "Constant 'technical error' during payment."]
    },
    {
      title: "Support Transparency",
      summary: "Frustration regarding unresponsive support for redemption and unit tracking.",
      quotes: ["I initiated a redemption 3 days ago, still haven't received funds.", "SIP amount deducted but can't see units."]
    }
  ];

  const actions = [
    "Fix UPI gateway stability to prevent deducting funds without unit allocation.",
    "Streamline KYC verification with real-time status updates in-app.",
    "Optimize portfolio load times and unit tracking sync for better visibility."
  ];

  const emailDraft = `Subject: Weekly Pulse: User Insights to Inform Our Product Roadmap

Dear Product and Growth Teams,

This week's pulse note highlights key user insights:
- Ease of use: Clean interface is a winner.
- Technical issues: UPI and KYC need immediate attention.
- Support: Transparency on redemption is lacking.

Proposed Actions:
1. Fix UPI gateway stability.
2. Streamline KYC status updates.
3. Optimize portfolio load times.

Best regards,
Insights Engine`;

  return (
    <div className="dashboard" ref={dashboardRef}>
      <header className="header">
        <h1>Weekly Product Pulse</h1>
        <p>Insights for <strong>SBI Mutual Fund</strong> | Apr 15 - Apr 22</p>
      </header>

      <main>
        <section className="theme-grid">
          {themes.map((theme, i) => (
            <div key={i} className="theme-card">
              <span className="tag">TOP THEME</span>
              <h3>{theme.title}</h3>
              <p>{theme.summary}</p>
            </div>
          ))}
        </section>

        <section className="actions-section">
          <h2>Recommended Actions</h2>
          <div className="action-list">
            {actions.map((action, i) => (
              <div key={i} className="action-item">
                <h4>Insight {i + 1}</h4>
                <p>{action}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <button className="fab" onClick={() => setEmailPanelOpen(true)}>
        Email Team
      </button>

      <div className={`email-panel ${isEmailPanelOpen ? 'active' : ''}`}>
        <h2>Email Draft</h2>
        <div className="email-content">{emailDraft}</div>
        <button className="close-panel" onClick={() => setEmailPanelOpen(false)}>
          Close Panel
        </button>
      </div>
    </div>
  );
};

export default App;
