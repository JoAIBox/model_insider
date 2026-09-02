import React, { useState } from 'react';

export const UnembedDeepDive: React.FC = () => {
  const [temp, setTemp] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(0.8);
  const [mtpTokens, setMtpTokens] = useState<number>(2);

  // Sample candidate logits for visualization
  const candidates = [
    { token: '混合', logit: 8.4, baseProb: 0.52 },
    { token: '架构', logit: 6.8, baseProb: 0.28 },
    { token: '模型', logit: 5.1, baseProb: 0.12 },
    { token: '网络', logit: 3.9, baseProb: 0.05 },
    { token: '系统', logit: 2.5, baseProb: 0.03 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎯</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              LM Head 输出头与 Multi-Token Prediction (MTP)
            </h2>
            <span style={{ background: 'rgba(244, 114, 182, 0.15)', color: '#f472b6', border: '1px solid #f472b6', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              151,936 Vocab · MTP 多位置前瞻预测
            </span>
          </div>
          <p style={{ fontSize: '1rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            LM Head 将骨干网最终层的高维隐藏状态映射为 151,936 维的未归一化词表得分（Logits）。Qwen 3.8 采用解耦词嵌入（Untied Embeddings）与 MTP（多 Token 预测）架构，在训练期同时监督未来 \(K\) 个 Token 的预测，大幅提升推理期投机解码的接受率与训练样本利用效率。
          </p>
        </div>
      </div>

      {/* 2. Innovation Panel */}
      <div style={{ background: 'rgba(244, 114, 182, 0.05)', border: '1px solid rgba(244, 114, 182, 0.3)', borderRadius: '10px', padding: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#f472b6', margin: '0 0 10px 0', fontWeight: 'bold' }}>
          ⭐ 核心创新：MTP 为何能加速训练与投机推理？
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px' }}>
            <strong style={{ color: '#67e8f9' }}>1. 稠密监督信号 (Dense Supervision)</strong>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
              传统自回归每步只预测 \(t+1\) 位置。MTP 让每个位置同时预测 \(t+1, t+2, \dots, t+K\)，使得单步前向传播获得成倍的梯度反馈。
            </p>
          </div>
          <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px' }}>
            <strong style={{ color: '#fbbf24' }}>2. 强制前瞻规划 (Planning Ahead)</strong>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
              为了预测后几个词，主干网络被迫在深层表示中构建更宏观的语义结构与长远因果逻辑，减少局部贪婪生成错误。
            </p>
          </div>
          <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px' }}>
            <strong style={{ color: '#10B981' }}>3. 内建投机解码 (Speculative Decoding)</strong>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
              无需额外训练小草稿模型 (Draft Model)，主模型自身的 MTP 头即可在单次迭代中并行输出多个候选 Token 进行自验证。
            </p>
          </div>
        </div>
      </div>

      {/* 3. Interactive MTP & Sampling Simulation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        
        {/* Left: MTP Branching SVG */}
        <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(244, 114, 182, 0.2)' }}>
          <h4 style={{ color: '#f472b6', margin: '0 0 14px 0', fontWeight: 'bold' }}>
            MTP 多分支并行预测数据流 (深度监督)
          </h4>

          <svg width="100%" height="180" viewBox="0 0 460 180" style={{ background: '#02040a', borderRadius: '8px' }}>
            <defs>
              <marker id="mtp-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f472b6" />
              </marker>
            </defs>

            {/* Input state */}
            <rect x="20" y="65" width="80" height="50" rx="5" fill="#0F172A" stroke="#67e8f9" strokeWidth="1.5" />
            <text x="60" y="88" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle">主干输出</text>
            <text x="60" y="104" fill="#67e8f9" fontSize="10" fontFamily="monospace" textAnchor="middle">h_L,t</text>

            {/* Main LM Head */}
            <line x1="100" y1="90" x2="160" y2="40" stroke="#f472b6" strokeWidth="2" markerEnd="url(#mtp-arrow)" />
            <rect x="160" y="15" width="120" height="45" rx="5" fill="#0F172A" stroke="#10b981" strokeWidth="1.5" />
            <text x="220" y="36" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle">主头: Next Token</text>
            <text x="220" y="50" fill="#FFF" fontSize="10" fontFamily="monospace" textAnchor="middle">P(w_(t+1) | x)</text>

            {/* MTP 1 */}
            <line x1="100" y1="90" x2="160" y2="90" stroke="#f472b6" strokeWidth="2" markerEnd="url(#mtp-arrow)" />
            <rect x="160" y="70" width="120" height="45" rx="5" fill="#0F172A" stroke="#f472b6" strokeWidth="1.5" />
            <text x="220" y="91" fill="#f472b6" fontSize="11" fontWeight="bold" textAnchor="middle">MTP 头 1: +2 Token</text>
            <text x="220" y="105" fill="#FFF" fontSize="10" fontFamily="monospace" textAnchor="middle">P(w_(t+2) | x)</text>

            {/* MTP 2 */}
            <line x1="100" y1="90" x2="160" y2="140" stroke="#f472b6" strokeWidth="2" markerEnd="url(#mtp-arrow)" />
            <rect x="160" y="125" width="120" height="45" rx="5" fill="#0F172A" stroke="#fbbf24" strokeWidth="1.5" />
            <text x="220" y="146" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">MTP 头 2: +3 Token</text>
            <text x="220" y="160" fill="#FFF" fontSize="10" fontFamily="monospace" textAnchor="middle">P(w_(t+3) | x)</text>

            {/* Loss combination */}
            <line x1="280" y1="37" x2="350" y2="85" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="280" y1="92" x2="350" y2="90" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="280" y1="147" x2="350" y2="95" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

            <rect x="350" y="65" width="90" height="50" rx="5" fill="#1e293b" stroke="#FFF" strokeWidth="1" />
            <text x="395" y="88" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">联合损失</text>
            <text x="395" y="104" fill="#fbbf24" fontSize="10" fontFamily="monospace" textAnchor="middle">Σ λ_k · L_k</text>
          </svg>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>MTP 预测深度:</span>
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setMtpTokens(num)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: mtpTokens === num ? '1px solid #f472b6' : '1px solid rgba(255,255,255,0.1)',
                  background: mtpTokens === num ? 'rgba(244,114,182,0.2)' : '#0F172A',
                  color: mtpTokens === num ? '#f472b6' : '#94A3B8',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                +{num} Token
              </button>
            ))}
          </div>
        </div>

        {/* Right: Candidate Logits & Sampling */}
        <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h4 style={{ color: '#10b981', margin: '0 0 10px 0', fontWeight: 'bold' }}>
            采样解码概率分布 (Temperature = {temp.toFixed(1)})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {candidates.map((item) => {
              // Rescale prob with temp
              const scaledProb = Math.pow(item.baseProb, 1 / temp);
              return (
                <div key={item.token} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <span style={{ width: '40px', color: '#FFF', fontWeight: 'bold' }}>"{item.token}"</span>
                  <div style={{ flex: 1, height: '14px', background: '#0F172A', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, scaledProb * 100)}%`, height: '100%', background: '#10b981', borderRadius: '3px', transition: 'width 0.2s' }} />
                  </div>
                  <span style={{ width: '50px', textAlign: 'right', fontFamily: 'monospace', color: '#67e8f9' }}>
                    {(scaledProb * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8', width: '80px' }}>Temperature:</span>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.1"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>
        </div>

      </div>

    </div>
  );
};
