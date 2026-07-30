import React, { useState } from 'react';

export const UnembeddingOperatorDeepDive: React.FC = () => {
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(0.9);
  const [activeTab, setActiveTab] = useState<'formula' | 'logitsSoftmax' | 'sampling'>('formula');

  // Sample logits for top 5 tokens in vocabulary
  const sampleLogits = [
    { token: 'Kimi', logit: 12.4, id: 4821 },
    { token: 'DeepSeek', logit: 11.2, id: 9102 },
    { token: 'Architecture', logit: 9.8, id: 1420 },
    { token: 'Transformer', logit: 8.5, id: 3310 },
    { token: 'Token', logit: 7.1, id: 504 },
  ];

  // Temperature scaled logits & Softmax
  const scaledLogits = sampleLogits.map(item => item.logit / temperature);
  const maxLogit = Math.max(...scaledLogits);
  const expLogits = scaledLogits.map(l => Math.exp(l - maxLogit));
  const sumExp = expLogits.reduce((a, b) => a + b, 0);
  const probabilities = expLogits.map(e => e / sumExp);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎯</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              Unembedding (输出预测头) 算子原理与计算推导
            </h2>
            <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid #F59E0B', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Final Logits & Token Probability Generator
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            解密 Kimi K3 最后一层隐藏状态 h_(T,93) (维度 7,168) 经过最终 RMSNorm 与词表矩阵投影生成下一个 Token 的完整数学流程
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('formula')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'formula' ? '#F59E0B' : 'transparent',
              color: activeTab === 'formula' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            1. 全流程推导公式
          </button>
          <button
            onClick={() => setActiveTab('logitsSoftmax')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'logitsSoftmax' ? '#38BDF8' : 'transparent',
              color: activeTab === 'logitsSoftmax' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            2. Logits 与 Softmax 概率模拟
          </button>
          <button
            onClick={() => setActiveTab('sampling')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'sampling' ? '#10B981' : 'transparent',
              color: activeTab === 'sampling' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            3. Temperature & Top-p 采样控制台
          </button>
        </div>
      </div>

      {/* TAB 1: FORMULA & MATHEMATICAL FLOW */}
      {activeTab === 'formula' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Formula Card */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#F59E0B', margin: 0, fontWeight: 'bold' }}>
              📐 Unembedding 核心计算公式 (Mathematical Formulation)
            </h3>
            
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '1.1rem', color: '#FFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>// 1. 最终 RMSNorm 归一化</div>
              <div style={{ color: '#38BDF8' }}>h_final = RMSNorm( h_(T,93) ) (维度: 7,168)</div>
              <div>// 2. 词表矩阵投影点积生成原始 Logits 得分向量</div>
              <div style={{ color: '#A78BFA' }}>z = W_unembed · h_final (维度: V = 128,000)</div>
              <div>// 3. 温度缩放与 Softmax 概率分布生成</div>
              <div style={{ color: '#10B981' }}>P(w_i) = exp( z_i / T ) / Σ_j exp( z_j / T )</div>
            </div>
          </div>

          {/* SVG Diagram */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 820 260" width="100%" height="260" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-unembed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F59E0B" />
                </marker>
              </defs>

              {/* Layer 93 Output */}
              <rect x="20" y="90" width="150" height="80" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
              <text x="95" y="125" fill="#38BDF8" fontSize="15" fontWeight="bold" textAnchor="middle">Layer 93 h_T</text>
              <text x="95" y="148" fill="#94A3B8" fontSize="13" fontFamily="monospace" textAnchor="middle">ℝ^(7,168)</text>

              <line x1="170" y1="130" x2="230" y2="130" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-unembed)" />

              {/* Final RMSNorm */}
              <rect x="230" y="90" width="150" height="80" rx="8" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="2" />
              <text x="305" y="125" fill="#38BDF8" fontSize="15" fontWeight="bold" textAnchor="middle">Final RMSNorm</text>
              <text x="305" y="148" fill="#FFF" fontSize="13" fontFamily="monospace" textAnchor="middle">归一化模长</text>

              <line x1="380" y1="130" x2="440" y2="130" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-unembed)" />

              {/* W_unembed Projection */}
              <rect x="440" y="90" width="180" height="80" rx="8" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="2" />
              <text x="530" y="125" fill="#F59E0B" fontSize="15" fontWeight="bold" textAnchor="middle">W_unembed 矩阵</text>
              <text x="530" y="148" fill="#FFF" fontSize="13" fontFamily="monospace" textAnchor="middle">128,000 × 7,168</text>

              <line x1="620" y1="130" x2="680" y2="130" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-unembed)" />

              {/* Token Probabilities */}
              <rect x="680" y="90" width="130" height="80" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
              <text x="745" y="125" fill="#FFF" fontSize="15" fontWeight="bold" textAnchor="middle">Token 概率 P</text>
              <text x="745" y="148" fill="#10B981" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Softmax(z/T)</text>
            </svg>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE TEMPERATURE & LOGITS SIMULATOR */}
      {activeTab === 'logitsSoftmax' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#38BDF8', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🧪 温度参数 Temperature (T) 对概率分布平滑度的影响
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              拖动 Temperature 采样温度滑块，观察 Top 5 候选 Token 的 Logits 得分如何被重塑为概率分布。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
            {/* Control Sliders */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>采样控制参数</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>Temperature (T):</span>
                  <span style={{ color: '#F59E0B', fontWeight: 'bold', fontFamily: 'monospace' }}>{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>Top-p (Nucleus Cutoff):</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>{topP.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Probability Histogram */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>Top Candidate Tokens 概率分布图</span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sampleLogits.map((item, idx) => {
                  const prob = probabilities[idx];
                  const probPercent = (prob * 100).toFixed(1);
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                        <span style={{ color: '#FFF', fontWeight: 'bold' }}>"{item.token}" (ID: {item.id})</span>
                        <span style={{ color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>{probPercent}%</span>
                      </div>
                      <div style={{ background: '#0F172A', height: '14px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ background: idx === 0 ? '#10B981' : '#38BDF8', width: `${probPercent}%`, height: '100%' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
