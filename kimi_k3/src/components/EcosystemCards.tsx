import React, { useState } from 'react';

export const EcosystemCards: React.FC = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const cardData = [
    {
      id: 0,
      name: "MoonEP",
      tagline: "Dynamic Redundant Expert Parallelism Library",
      desc: "Mixture-of-Experts (MoE) training and inference in large models often slow down GPU cluster throughput due to load backlogs on hot experts (e.g., general dialogue experts). MoonEP actively monitors expert queues and dynamically clones hot expert weight replicas onto idle GPU nodes, significantly alleviating tail latency bottlenecks.",
      metrics: ["Tail Latency Reduced by 45%", "Bandwidth Utilization at 92%", "Elastic Scaling to 1000+ GPUs"],
      colorClass: "blue"
    },
    {
      id: 1,
      name: "FlashKDA",
      tagline: "Hardware-Level CUDA/CUTLASS DPLR Operators",
      desc: "Designed for Kimi Delta Attention's custom Diagonal-Plus-Low-Rank (DPLR) transition matrices. Traditional CUDA kernels cannot leverage Tensor Cores effectively for such parallel scan operations. FlashKDA utilizes CUTLASS to rewrite memory loads, Shared Memory tiling, and pipelining, greatly accelerating state updates and scanning.",
      metrics: ["Prefill Speedup of 4.2x", "Shared Memory Reduced by 60%", "Supports Variable-Length Batch Parallelism"],
      colorClass: "violet"
    },
    {
      id: 2,
      name: "AgentEnv",
      tagline: "Firecracker Lightweight Micro-Sandbox Network",
      desc: "During Kimi-K3's reinforcement learning (RL) process, agents must constantly execute code and receive feedback for backtracking/error correction, requiring thousands of isolated environments. AgentEnv, built on AWS Firecracker microVMs, cold-starts a complete Linux OS sandbox in milliseconds and supports VM state check-pointing and state forking in seconds.",
      metrics: ["VM Boot Time < 5ms", "Snapshot Cloning < 2ms", "Hardware Overhead Reduced by 90%"],
      colorClass: "green"
    }
  ];

  return (
    <div className="tab-panel active">
      <header>
        <div className="badge">Chapter 5</div>
        <h1>Open Source Ecosystem & Infrastructure</h1>
        <p className="subtitle">Co-designed system-level toolchain optimizing hardware execution</p>
      </header>

      <div className="ecosystem-grid">
        {cardData.map(card => (
          <div 
            key={card.id}
            className={`eco-card ${activeCard === card.id ? 'active-detail' : ''}`}
            onClick={() => setActiveCard(activeCard === card.id ? null : card.id)}
            style={{ 
              cursor: 'pointer',
              border: activeCard === card.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              boxShadow: activeCard === card.id ? 'var(--glow-primary)' : 'none'
            }}
          >
            <div className="eco-header">
              <div className={`eco-icon ${card.colorClass === 'violet' ? 'violet' : card.colorClass === 'green' ? 'green' : ''}`}>
                {card.id === 0 ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                ) : card.id === 1 ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>
                )}
              </div>
              <div>
                <div className="eco-name">{card.name}</div>
                <div style={{ fontSize: '1.15rem', color: '#94A3B8' }}>{card.tagline}</div>
              </div>
            </div>
            <p className="eco-desc" style={{ fontSize: '1.02rem', lineHeight: '1.6' }}>
              {card.desc}
            </p>
            
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>Key Performance Indicators:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {card.metrics.map((metric, mIdx) => (
                  <div key={mIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.15rem', color: '#34D399' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    {metric}
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ fontSize: '1.15rem', color: '#64748B', marginTop: '12px', textAlign: 'right', fontStyle: 'italic' }}>
              Click card to collapse details
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
