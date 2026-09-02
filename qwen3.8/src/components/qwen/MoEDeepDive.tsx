import React, { useState, useEffect, useRef } from 'react';

export const MoEDeepDive: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(3);
  const [activeK, setActiveK] = useState(10);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const steps = ['接收 Token', '计算专家分数', '路由选择专家', '加权合并输出'];

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStep((s) => (s + 1) % steps.length);
      }, 1500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length]);

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif', color: '#fff', backgroundColor: '#070a12', padding: '24px', borderRadius: '16px', border: '1px solid rgba(196, 181, 253, 0.2)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '12px' }}>
          🔀 SwiGLU FFN / MoE 稀疏路由
          <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: 'rgba(196, 181, 253, 0.1)', border: '1px solid #c4b5fd', borderRadius: '12px' }}>A95B/Flash 专属</span>
        </h2>
        <p style={{ margin: 0, opacity: 0.8 }}>大模型时代的稀疏计算范式，让参数规模与推理成本脱钩。</p>
      </div>

      {/* Innovation & Motivation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#0e1421', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#fbbf24' }}>⭐ 核心创新</h4>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, opacity: 0.9 }}>
            MoE = 大参数容量 + 低计算成本 → 2.4T 参数仅激活 95B。通过细粒度专家划分，模型具备海量知识。
          </p>
        </div>
        <div style={{ backgroundColor: '#0e1421', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#67e8f9' }}>💡 设计动机</h4>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, opacity: 0.9 }}>
            Dense FFN 限制了容量。MoE 解耦了参数和计算，让大模型能在计算资源有限的情况下容纳更多知识。
          </p>
        </div>
      </div>

      {/* Interactive SVG */}
      <div style={{ backgroundColor: '#0e1421', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>MoE 路由过程演示</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ padding: '6px 12px', backgroundColor: isPlaying ? 'rgba(251, 191, 36, 0.2)' : 'rgba(103, 232, 249, 0.2)', border: `1px solid ${isPlaying ? '#fbbf24' : '#67e8f9'}`, color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
            >
              {isPlaying ? '暂停' : '播放'}
            </button>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px' }}>Top-K: {activeK}</span>
              <input type="range" min="1" max="20" value={activeK} onChange={(e) => setActiveK(Number(e.target.value))} style={{ width: '80px' }} />
            </div>
          </div>
        </div>
        
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', backgroundColor: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
          {steps.map((s, i) => (
            <div key={i} style={{ position: 'relative', zIndex: 1, backgroundColor: step >= i ? '#c4b5fd' : '#1f2937', color: step >= i ? '#000' : '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
              {s}
            </div>
          ))}
        </div>

        {/* SVG Visualization */}
        <svg width="100%" height="280" viewBox="0 0 540 280">
          <rect width="100%" height="100%" fill="#070a12" rx="12" />
          
          {/* Token Input */}
          <g transform="translate(30, 140)">
            <rect x="-20" y="-15" width="40" height="30" fill={step >= 0 ? '#67e8f9' : '#374151'} rx="4" />
            <text x="0" y="5" fill="#000" fontSize="12" textAnchor="middle" fontWeight="bold">Token</text>
            
            {step >= 1 && (
              <path d="M 20 0 L 80 -40 M 20 0 L 80 40" stroke="#c4b5fd" strokeWidth="2" strokeDasharray="4" fill="none" opacity="0.6" />
            )}
          </g>

          {/* Router */}
          {step >= 1 && (
            <g transform="translate(140, 140)">
              <rect x="-30" y="-80" width="60" height="160" fill="rgba(196, 181, 253, 0.1)" stroke="#c4b5fd" strokeWidth="2" rx="8" />
              <text x="0" y="-90" fill="#c4b5fd" fontSize="12" textAnchor="middle">Router</text>
              {/* Bar chart scores */}
              {Array.from({length: 8}).map((_, i) => (
                <rect key={i} x="-20" y={-60 + i * 18} width={20 + Math.random() * 20} height="10" fill={i < activeK ? '#fbbf24' : '#4b5563'} rx="2" />
              ))}
              
              {step >= 2 && (
                <path d="M 30 -40 L 120 -80 M 30 40 L 120 80" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.6" />
              )}
            </g>
          )}

          {/* Experts Grid */}
          {step >= 2 && (
            <g transform="translate(320, 140)">
              {/* Shared Expert */}
              <circle cx="0" cy="0" r="16" fill="#f472b6" opacity="0.8" />
              <text x="0" y="4" fill="#000" fontSize="10" textAnchor="middle" fontWeight="bold">S</text>
              
              {/* 4x5 Grid */}
              {Array.from({length: 20}).map((_, i) => {
                const x = -45 + (i % 4) * 30;
                const y = -75 + Math.floor(i / 4) * 30;
                const isSelected = i < activeK;
                // Exclude the center area for Shared Expert
                if (Math.abs(x) < 20 && Math.abs(y) < 20) return null;

                return (
                  <g key={i} transform={`translate(${x}, ${y})`}>
                    <circle cx="0" cy="0" r="10" fill={isSelected ? '#fbbf24' : '#374151'} />
                    {isSelected && step === 3 && (
                      <path d={`M 10 0 L ${120 - x} ${-y}`} stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Output Merge */}
          {step >= 3 && (
            <g transform="translate(480, 140)">
              <rect x="-20" y="-15" width="40" height="30" fill="#c4b5fd" rx="4" />
              <text x="0" y="5" fill="#000" fontSize="12" textAnchor="middle" fontWeight="bold">Merge</text>
            </g>
          )}
        </svg>
      </div>

      {/* Math & Capacity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ backgroundColor: '#0e1421', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>数学表达</h4>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: '#a78bfa', backgroundColor: '#070a12', padding: '12px', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0' }}>s = softmax(W_r · x)</p>
            <p style={{ margin: '0 0 8px 0' }}>h_i = SwiGLU(x)</p>
            <p style={{ margin: 0, color: '#fbbf24' }}>y = Σ s_i · h_i + h_shared</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#0e1421', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>参数容量对比</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', width: '40px' }}>Dense</span>
              <div style={{ flex: 1, height: '12px', backgroundColor: '#374151', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: '10%', height: '100%', backgroundColor: '#67e8f9' }} />
              </div>
              <span style={{ fontSize: '12px', width: '30px' }}>27B</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', width: '40px' }}>MoE</span>
              <div style={{ flex: 1, height: '12px', backgroundColor: '#374151', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: '4%', height: '100%', backgroundColor: '#fbbf24' }} />
                <div style={{ width: '96%', height: '100%', backgroundColor: 'rgba(196, 181, 253, 0.3)' }} />
              </div>
              <span style={{ fontSize: '12px', width: '30px' }}>2.4T</span>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', opacity: 0.6 }}>注：黄色为激活参数(95B)，紫色为总容量(2.4T)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
