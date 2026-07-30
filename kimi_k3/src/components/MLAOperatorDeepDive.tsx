import React, { useState } from 'react';

export const MLAOperatorDeepDive: React.FC = () => {
  const [compressDim, setCompressDim] = useState<number>(512); // Low rank KV compression dimension d_c
  const [activeTab, setActiveTab] = useState<'architecture' | 'memoryReduction' | 'mathDerivation'>('architecture');

  // Memory savings calculation vs standard MHA (Multi-Head Attention)
  const numHeads = 96;
  const headDim = 128;
  const standardKVPerToken = 2 * numHeads * headDim; // 2 * 96 * 128 = 24,576 numbers per token in standard MHA
  const mlaKVPerToken = compressDim + 64; // Compressed KV (512) + RoPE Key (64) = 576 numbers
  const savingsRatio = (standardKVPerToken / mlaKVPerToken).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🧠</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              MLA (Multi-Head Latent Attention) 低秩隐空间注意力原理与推导
            </h2>
            <span style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA', border: '1px solid #A78BFA', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Gated Low-Rank KV Compression (24 Periodic Layers)
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            解密 Kimi K3 Backbone 中每隔 4 层出现的周期性 MLA 子模块：通过低秩矩阵 $W_c$ 压缩 KV Cache，实现 16 倍以上的推理显存暴降
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('architecture')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'architecture' ? '#A78BFA' : 'transparent',
              color: activeTab === 'architecture' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            1. 低秩压缩架构图解
          </button>
          <button
            onClick={() => setActiveTab('memoryReduction')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'memoryReduction' ? '#38BDF8' : 'transparent',
              color: activeTab === 'memoryReduction' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            2. KV Cache 16× 显存暴降计算器
          </button>
          <button
            onClick={() => setActiveTab('mathDerivation')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'mathDerivation' ? '#10B981' : 'transparent',
              color: activeTab === 'mathDerivation' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            3. 重构解压矩阵数学推导
          </button>
        </div>
      </div>

      {/* TAB 1: LOW RANK ARCHITECTURE DIAGRAM */}
      {activeTab === 'architecture' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Formula Card */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#A78BFA', margin: 0, fontWeight: 'bold' }}>
              📐 MLA 低秩投影与解压公式 (Low-Rank Key/Value Projection)
            </h3>
            
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '1.1rem', color: '#FFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>// 1. KV 隐空间低秩压缩向量 (Low-Rank KV Latent Vector)</div>
              <div style={{ color: '#A78BFA' }}>c_t^(KV) = W_c · x_t (维度 d_c = 512)</div>
              <div>// 2. 解码重构多头 Key / Value 矩阵</div>
              <div style={{ color: '#38BDF8' }}>K_t = W_uk · c_t^(KV), V_t = W_uv · c_t^(KV)</div>
            </div>
          </div>

          {/* SVG Diagram for MLA Low-Rank Flow */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 820 280" width="100%" height="280" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-mla" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#A78BFA" />
                </marker>
              </defs>

              {/* Input x_t */}
              <rect x="20" y="100" width="140" height="80" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
              <text x="90" y="135" fill="#38BDF8" fontSize="15" fontWeight="bold" textAnchor="middle">Input x_t</text>
              <text x="90" y="158" fill="#94A3B8" fontSize="13" fontFamily="monospace" textAnchor="middle">ℝ^(7,168)</text>

              <line x1="160" y1="140" x2="230" y2="140" stroke="#A78BFA" strokeWidth="2" markerEnd="url(#arrow-mla)" />

              {/* Low Rank Compression Matrix W_c */}
              <rect x="230" y="100" width="180" height="80" rx="8" fill="rgba(167, 139, 250, 0.15)" stroke="#A78BFA" strokeWidth="2" />
              <text x="320" y="135" fill="#A78BFA" fontSize="15" fontWeight="bold" textAnchor="middle">压缩矩阵 W_c</text>
              <text x="320" y="158" fill="#FFF" fontSize="13" fontFamily="monospace" textAnchor="middle">512 × 7,168</text>

              <line x1="410" y1="140" x2="470" y2="140" stroke="#A78BFA" strokeWidth="2" markerEnd="url(#arrow-mla)" />

              {/* Latent KV Cache Box */}
              <rect x="470" y="100" width="160" height="80" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
              <text x="550" y="130" fill="#FFF" fontSize="15" fontWeight="bold" textAnchor="middle">Latent Cache c_t</text>
              <text x="550" y="152" fill="#10B981" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">仅存 d_c=512</text>

              {/* Up Projection Arrows */}
              <line x1="630" y1="120" x2="690" y2="70" stroke="#38BDF8" strokeWidth="1.5" />
              <line x1="630" y1="160" x2="690" y2="210" stroke="#38BDF8" strokeWidth="1.5" />

              {/* Un-projected K and V */}
              <rect x="690" y="40" width="110" height="60" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
              <text x="745" y="68" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">Key K_t (W_uk)</text>
              <text x="745" y="86" fill="#94A3B8" fontSize="12" textAnchor="middle">96 × 128</text>

              <rect x="690" y="180" width="110" height="60" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
              <text x="745" y="208" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">Val V_t (W_uv)</text>
              <text x="745" y="226" fill="#94A3B8" fontSize="12" textAnchor="middle">96 × 128</text>
            </svg>
          </div>
        </div>
      )}

      {/* TAB 2: KV CACHE MEMORY REDUCTION CALCULATOR */}
      {activeTab === 'memoryReduction' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#38BDF8', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              📊 传统 MHA vs MLA 隐空间压缩显存消耗对比计算器
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              调节低秩压缩维度 $d_c$，观察单 Token 的 KV Cache 显存节省倍率。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
            {/* Left Control Slider */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>控制压缩维度 d_c</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>低秩维度 d_c:</span>
                  <span style={{ color: '#A78BFA', fontWeight: 'bold', fontFamily: 'monospace' }}>{compressDim}</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="1024"
                  step="128"
                  value={compressDim}
                  onChange={(e) => setCompressDim(parseInt(e.target.value))}
                />
              </div>

              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '6px', border: '1px solid #10B981', textAlign: 'center' }}>
                <div style={{ fontSize: '0.95rem', color: '#94A3B8' }}>KV Cache 显存节省倍率:</div>
                <div style={{ fontSize: '1.8rem', color: '#10B981', fontWeight: 'bold', margin: '4px 0' }}>
                  {savingsRatio} 倍！
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>相比传统 96 头 MHA 的 24,576 个元素/Token</div>
              </div>
            </div>

            {/* Right Comparison Display */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>每个 Token 的 KV 存储元素对比</span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ background: '#0F172A', padding: '14px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <div style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '1rem' }}>❌ 传统 MHA (Multi-Head Attn)</div>
                  <div style={{ fontSize: '1.4rem', color: '#FFF', fontWeight: 'bold', margin: '8px 0', fontFamily: 'monospace' }}>
                    24,576 元素
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#94A3B8' }}>必须完整保存 96 个 Head 的所有 Key 和 Value 矩阵。</div>
                </div>

                <div style={{ background: '#0F172A', padding: '14px', borderRadius: '6px', border: '1px solid #10B981' }}>
                  <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1rem' }}>✅ Kimi K3 采用的 MLA</div>
                  <div style={{ fontSize: '1.4rem', color: '#10B981', fontWeight: 'bold', margin: '8px 0', fontFamily: 'monospace' }}>
                    {mlaKVPerToken} 元素
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#94A3B8' }}>仅保存 {compressDim} 维低秩压缩向量 + 64 维 RoPE 动态解压。</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
