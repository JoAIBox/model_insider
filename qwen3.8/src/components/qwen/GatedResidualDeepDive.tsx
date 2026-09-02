import React, { useState } from 'react';

export const GatedResidualDeepDive: React.FC = () => {
  const [gates, setGates] = useState([0.8, 0.6, 0.9, 0.4]);
  const branchNames = ['GDN 输出', '注意力输出', 'FFN/MoE 输出', 'N-gram 输出'];
  const branchColors = ['#67e8f9', '#c4b5fd', '#fbbf24', '#f472b6'];

  const handleGateChange = (index: number, value: number) => {
    const newGates = [...gates];
    newGates[index] = value;
    setGates(newGates);
  };

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif', color: '#fff', backgroundColor: '#070a12', padding: '24px', borderRadius: '16px', border: '1px solid rgba(244, 114, 182, 0.2)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#f472b6', display: 'flex', alignItems: 'center', gap: '12px' }}>
          🔗 4-Way Gated Residual：多路门控残差
          <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: 'rgba(244, 114, 182, 0.1)', border: '1px solid #f472b6', borderRadius: '12px' }}>FLASH-NEXT 专属</span>
        </h2>
        <p style={{ margin: 0, opacity: 0.8 }}>打破传统单一残差连接，实现多组件输出的动态融合。</p>
      </div>

      {/* Innovation & Motivation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#0e1421', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#fbbf24' }}>⭐ 核心创新</h4>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, opacity: 0.9 }}>
            传统 y = x + f(x) 只有 2 路。4-Way 引入 4 路可学习加权混合，网络可根据上下文动态决定依赖哪一部分。
          </p>
        </div>
        <div style={{ backgroundColor: '#0e1421', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#67e8f9' }}>💡 设计动机</h4>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, opacity: 0.9 }}>
            在 Hybrid 架构中，GDN 擅长长上下文，Attention 擅长精确检索，N-gram 擅长局部模式。多路混合是必然需求。
          </p>
        </div>
      </div>

      {/* Interactive SVG */}
      <div style={{ backgroundColor: '#0e1421', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>门控混频可视化</h3>
        
        <svg width="100%" height="260" viewBox="0 0 540 260">
          <rect width="100%" height="100%" fill="#070a12" rx="12" />
          
          {/* Inputs */}
          {branchNames.map((name, i) => (
            <g key={i} transform={`translate(30, ${40 + i * 60})`}>
              <rect x="0" y="-15" width="90" height="30" fill="rgba(255,255,255,0.05)" stroke={branchColors[i]} rx="4" />
              <text x="45" y="5" fill="#fff" fontSize="11" textAnchor="middle">{name}</text>
              <path d={`M 90 0 L 160 0`} stroke={branchColors[i]} strokeWidth={2 + gates[i] * 6} opacity={0.3 + gates[i] * 0.7} />
            </g>
          ))}

          {/* Gate Controls (visually represented in SVG, actual controls below) */}
          <g transform="translate(160, 20)">
            <rect x="0" y="0" width="40" height="220" fill="rgba(255,255,255,0.05)" rx="8" stroke="#4b5563" strokeDasharray="4" />
            {gates.map((g, i) => (
              <circle key={i} cx="20" cy={20 + i * 60} r={6 + g * 8} fill={branchColors[i]} opacity={0.8} />
            ))}
          </g>

          {/* Bottleneck & Output */}
          <g transform="translate(200, 130)">
            {gates.map((g, i) => (
              <path key={i} d={`M 0 ${-90 + i * 60} C 60 ${-90 + i * 60} 60 0 120 0`} stroke={branchColors[i]} strokeWidth={2 + g * 6} fill="none" opacity={0.5} />
            ))}
            
            <rect x="120" y="-30" width="80" height="60" fill="rgba(251, 191, 36, 0.1)" stroke="#fbbf24" strokeWidth="2" rx="8" />
            <text x="160" y="-5" fill="#fbbf24" fontSize="12" textAnchor="middle">Rank 320</text>
            <text x="160" y="15" fill="#fbbf24" fontSize="10" textAnchor="middle">Bottleneck</text>

            <path d="M 200 0 L 260 0" stroke="#fff" strokeWidth="4" />
            <rect x="260" y="-15" width="60" height="30" fill="#fff" rx="4" />
            <text x="290" y="5" fill="#000" fontSize="12" textAnchor="middle" fontWeight="bold">Output</text>
          </g>
        </svg>

        {/* Sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
          {branchNames.map((name, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: branchColors[i], fontSize: '12px', width: '80px' }}>{name}</span>
              <input type="range" min="0" max="1" step="0.1" value={gates[i]} onChange={(e) => handleGateChange(i, Number(e.target.value))} style={{ flex: 1 }} />
              <span style={{ fontSize: '12px', width: '24px' }}>{gates[i].toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Math & Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ backgroundColor: '#0e1421', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>数学表达</h4>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: '#a78bfa', backgroundColor: '#070a12', padding: '12px', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0' }}>g_i = sigmoid(W_gate_i · x)</p>
            <p style={{ margin: '0 0 8px 0', color: '#fbbf24' }}>y_mixed = Σ (g_i ⊙ h_i)</p>
            <p style={{ margin: 0 }}>y = x + W_proj(y_mixed)</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#0e1421', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>对比传统残差</h4>
          <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 8px 0', color: '#9ca3af' }}><span style={{ color: '#ef4444' }}>✗ 传统:</span> y = x + Attention(x)</p>
            <p style={{ margin: '0 0 8px 0', color: '#9ca3af' }}><span style={{ color: '#ef4444' }}>✗ 双分支:</span> y = x + Attn(x) + FFN(x)</p>
            <p style={{ margin: 0, color: '#10b981' }}><span style={{ color: '#10b981' }}>✓ 4-Way:</span> 通过秩为 320 的瓶颈层压缩通信，允许 4 个组件在低维空间内自由交互，显著提升了混合效率。</p>
          </div>
        </div>
      </div>
    </div>
  );
};
