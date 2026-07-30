import React, { useState } from 'react';

export const AttnResOperatorDeepDive: React.FC = () => {
  const [currentLayer, setCurrentLayer] = useState<number>(72);
  const [activeTab, setActiveTab] = useState<'formula' | 'decayCurve' | 'gradientHighway'>('formula');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🔗</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              AttnRes (Cross-Layer Attention Residuals) 跨层召回子模块原理与推导
            </h2>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid #38BDF8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Dynamic Layer-to-Layer Signal Retrieval
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            解密 Kimi K3 突破传统 Transformer 仅单层顺序残差传递的局限：允许第 l 层动态跨层召回前面任意历史层 k &lt; l 的隐藏状态
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
              background: activeTab === 'formula' ? '#38BDF8' : 'transparent',
              color: activeTab === 'formula' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            1. 跨层召回公式与注意力矩阵
          </button>
          <button
            onClick={() => setActiveTab('decayCurve')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'decayCurve' ? '#A78BFA' : 'transparent',
              color: activeTab === 'decayCurve' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            2. 层深度信号衰减分配曲线
          </button>
          <button
            onClick={() => setActiveTab('gradientHighway')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'gradientHighway' ? '#10B981' : 'transparent',
              color: activeTab === 'gradientHighway' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            3. 93 层深度反向传播高速公路
          </button>
        </div>
      </div>

      {/* TAB 1: CROSS LAYER RETRIEVAL FORMULA */}
      {activeTab === 'formula' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Formula Card */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#38BDF8', margin: 0, fontWeight: 'bold' }}>
              📐 AttnRes 跨层注意力召回计算公式
            </h3>
            
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '1.1rem', color: '#FFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>// 1. 第 l 层对历史层 k (k &lt; l) 的跨层 Softmax 检索权重</div>
              <div style={{ color: '#38BDF8' }}>α_(l,k) = Softmax_(k &lt; l) ( (q_l · k_kᵀ) / √d )</div>
              <div>// 2. 跨层历史隐藏状态加权累加</div>
              <div style={{ color: '#10B981' }}>h_l^(final) = h_l + Σ_(k &lt; l) α_(l,k) · h_k</div>
            </div>
          </div>

          {/* SVG Diagram for AttnRes Flow */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 820 260" width="100%" height="260" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-attnres" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38BDF8" />
                </marker>
              </defs>

              {/* Historical Layers */}
              <rect x="20" y="40" width="100" height="50" rx="6" fill="#0F172A" stroke="#94A3B8" />
              <text x="70" y="70" fill="#94A3B8" fontSize="13" textAnchor="middle">Layer 0 (Input)</text>

              <rect x="160" y="40" width="100" height="50" rx="6" fill="#0F172A" stroke="#94A3B8" />
              <text x="210" y="70" fill="#94A3B8" fontSize="13" textAnchor="middle">Layer 12 (KDA)</text>

              <rect x="300" y="40" width="100" height="50" rx="6" fill="#0F172A" stroke="#94A3B8" />
              <text x="350" y="70" fill="#94A3B8" fontSize="13" textAnchor="middle">Layer 48 (MLA)</text>

              {/* Cross Layer Arc Lines into Layer 72 */}
              <path d="M 70 90 C 70 180, 500 180, 540 140" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4,3" fill="none" markerEnd="url(#arrow-attnres)" />
              <path d="M 210 90 C 210 160, 500 160, 540 140" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4,3" fill="none" markerEnd="url(#arrow-attnres)" />
              <path d="M 350 90 C 350 140, 500 140, 540 140" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4,3" fill="none" markerEnd="url(#arrow-attnres)" />

              {/* Current Layer 72 Target */}
              <rect x="540" y="80" width="240" height="80" rx="8" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="2" />
              <text x="660" y="115" fill="#FFF" fontSize="15" fontWeight="bold" textAnchor="middle">Layer 72 (当前层)</text>
              <text x="660" y="138" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle">动态召回概率 α_72,k 累加</text>
            </svg>
          </div>
        </div>
      )}

      {/* TAB 2: DEPTH SIGNAL DECAY CURVE */}
      {activeTab === 'decayCurve' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#A78BFA', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              📈 动态层深度信号召回权重分配曲线
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              拖动当前目标层 Slider，观察当前层在召回前面历史层时的 Softmax 权重分布特征（对紧邻前一层权重最高，对远端 Layer 0 / Layer 12 保持轻量残差直连）。
            </p>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ color: '#94A3B8', fontSize: '1rem' }}>选择当前目标层 (Target Layer l):</span>
            <input
              type="range"
              min="4"
              max="93"
              value={currentLayer}
              onChange={(e) => setCurrentLayer(parseInt(e.target.value))}
              style={{ width: '240px' }}
            />
            <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1.1rem', fontFamily: 'monospace' }}>
              Layer {currentLayer}
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '1rem', color: '#FFF', fontWeight: 'bold' }}>
              对历史层 k ∈ [0, {currentLayer - 1}] 的召回权重 α_{currentLayer},k 分布:
            </span>

            <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '4px', background: '#0B0F19', padding: '10px', borderRadius: '6px' }}>
              {Array.from({ length: 24 }).map((_, idx) => {
                const layerIdx = Math.floor((idx / 23) * (currentLayer - 1));
                const dist = (currentLayer - layerIdx);
                const weight = Math.exp(-dist * 0.08) * 0.8 + 0.05;
                const heightPercent = Math.min(100, Math.max(10, weight * 100));
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      background: layerIdx === currentLayer - 1 ? '#10B981' : '#38BDF8',
                      height: `${heightPercent}%`,
                      borderRadius: '2px 2px 0 0'
                    }}
                    title={`Layer ${layerIdx}: α = ${weight.toFixed(3)}`}
                  />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94A3B8', fontFamily: 'monospace' }}>
              <span>Layer 0 (Input)</span>
              <span>Layer {Math.floor(currentLayer / 2)}</span>
              <span>Layer {currentLayer - 1} (前一层)</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
