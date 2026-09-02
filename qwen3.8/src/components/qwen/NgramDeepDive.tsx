import React, { useState } from 'react';

export const NgramDeepDive: React.FC = () => {
  const [inputText] = useState('大型语言模型');
  const [activeStep, setActiveStep] = useState(0);
  
  const tokens = inputText.split('');
  const bigrams = ['大型', '型语', '语言', '言模', '模型'];
  const trigrams = ['大型语', '型语言', '语言模', '言模型'];

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif', color: '#fff', backgroundColor: '#070a12', padding: '24px', borderRadius: '16px', border: '1px solid rgba(167, 243, 208, 0.2)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#34d399', display: 'flex', alignItems: 'center', gap: '12px' }}>
          📚 N-gram Embedding：局部模式O(1)捕获
          <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: 'rgba(52, 211, 153, 0.1)', border: '1px solid #34d399', borderRadius: '12px' }}>FLASH-NEXT 专属</span>
        </h2>
        <p style={{ margin: 0, opacity: 0.8 }}>利用海量查找表替代昂贵的注意力计算，以 O(1) 复杂度获取局部语义。</p>
      </div>

      {/* Innovation & Motivation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#0e1421', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#fbbf24' }}>⭐ 核心创新</h4>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, opacity: 0.9 }}>
            维护 20M 条目的 bigram/trigram 查找表。局部模式无需经过深层网络，直接作为免费的先验知识注入。
          </p>
        </div>
        <div style={{ backgroundColor: '#0e1421', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#67e8f9' }}>💡 设计动机</h4>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, opacity: 0.9 }}>
            常见的词组如"机器学习"、"New York"，模型无需重新计算注意力来理解其关联。将这部分计算卸载给查表。
          </p>
        </div>
      </div>

      {/* Interactive Visualization */}
      <div style={{ backgroundColor: '#0e1421', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>N-gram 提取与查表</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} style={{ padding: '6px 12px', backgroundColor: '#374151', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>上一步</button>
            <button onClick={() => setActiveStep(Math.min(tokens.length - 1, activeStep + 1))} style={{ padding: '6px 12px', backgroundColor: '#10b981', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>下一步</button>
          </div>
        </div>

        <svg width="100%" height="220" viewBox="0 0 540 220">
          <rect width="100%" height="100%" fill="#070a12" rx="12" />

          {/* Tokens */}
          <g transform="translate(60, 40)">
            {tokens.map((token, i) => (
              <g key={i} transform={`translate(${i * 60}, 0)`}>
                <rect x="0" y="0" width="40" height="40" fill={i === activeStep ? 'rgba(52, 211, 153, 0.2)' : '#1f2937'} stroke={i === activeStep ? '#34d399' : '#374151'} rx="6" />
                <text x="20" y="25" fill="#fff" fontSize="16" textAnchor="middle">{token}</text>
              </g>
            ))}
          </g>

          {/* Causal Window Highlight (t-2, t-1, t) */}
          <g transform={`translate(${60 + activeStep * 60}, 40)`}>
            {activeStep >= 1 && (
              <path d="M -40 45 L 20 75" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4" fill="none" opacity="0.5" />
            )}
            {activeStep >= 2 && (
              <path d="M -100 45 L 20 75" stroke="#f472b6" strokeWidth="2" strokeDasharray="4" fill="none" opacity="0.5" />
            )}
          </g>

          {/* Extraction Display */}
          <g transform="translate(60, 140)">
            <rect x="0" y="0" width="160" height="60" fill="#0e1421" stroke="#374151" rx="8" />
            <text x="10" y="20" fill="#9ca3af" fontSize="11">当前时间步 t={activeStep}</text>
            
            {activeStep >= 1 ? (
              <text x="10" y="40" fill="#60a5fa" fontSize="13">Bi: {bigrams[activeStep - 1]}</text>
            ) : (
              <text x="10" y="40" fill="#4b5563" fontSize="13">Bi: N/A</text>
            )}
            
            {activeStep >= 2 ? (
              <text x="80" y="40" fill="#f472b6" fontSize="13">Tri: {trigrams[activeStep - 2]}</text>
            ) : (
              <text x="80" y="40" fill="#4b5563" fontSize="13">Tri: N/A</text>
            )}
          </g>

          {/* Lookup Table */}
          <g transform="translate(280, 110)">
            <rect x="0" y="0" width="200" height="90" fill="rgba(52, 211, 153, 0.05)" stroke="#34d399" rx="8" />
            <text x="100" y="20" fill="#34d399" fontSize="12" textAnchor="middle">20M Lookup Table O(1)</text>
            
            {activeStep >= 1 && (
              <g transform="translate(20, 40)">
                <rect x="0" y="0" width="160" height="20" fill="#1f2937" rx="4" />
                <text x="80" y="14" fill="#fff" fontSize="10" textAnchor="middle">→ Embedding Vect (Bi)</text>
              </g>
            )}
            {activeStep >= 2 && (
              <g transform="translate(20, 65)">
                <rect x="0" y="0" width="160" height="20" fill="#1f2937" rx="4" />
                <text x="80" y="14" fill="#fff" fontSize="10" textAnchor="middle">→ Embedding Vect (Tri)</text>
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Math & Specs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ backgroundColor: '#0e1421', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>数学表达</h4>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: '#a78bfa', backgroundColor: '#070a12', padding: '12px', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0' }}>e_bi = E_bi[tok_{'{t-1}'}, tok_t]</p>
            <p style={{ margin: '0 0 8px 0' }}>e_tri = E_tri[tok_{'{t-2}'}, tok_{'{t-1}'}, tok_t]</p>
            <p style={{ margin: 0, color: '#34d399' }}>e_ngram(t) = e_bi + e_tri</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#0e1421', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>参数规模分配</h4>
          <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '4px', marginBottom: '8px' }}>
              <span>N-gram Embedding:</span>
              <span style={{ color: '#34d399' }}>51B Params</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '4px', marginBottom: '8px' }}>
              <span>Backbone (GDN/QSA):</span>
              <span style={{ color: '#60a5fa' }}>125B Params</span>
            </div>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>N-gram 占据了极大的参数比例，但由于是纯查表操作，几乎不增加推理计算负担 (FLOPs)。</p>
          </div>
        </div>
      </div>
    </div>
  );
};
