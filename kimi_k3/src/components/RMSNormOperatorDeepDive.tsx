import React, { useState } from 'react';

export const RMSNormOperatorDeepDive: React.FC = () => {
  const [eps, setEps] = useState<number>(1e-5);
  const [sampleScaleGamma, setSampleScaleGamma] = useState<number>(1.2);
  const [activeTab, setActiveTab] = useState<'formula' | 'stepByStep' | 'comparison' | 'fp8'>('formula');

  // Sample vector calculations for 8 demo dimensions
  const sampleVector = [1.2, -0.8, 2.1, -1.5, 0.9, -2.4, 1.8, -0.6];
  const rmsSquareMean = sampleVector.reduce((acc, v) => acc + v * v, 0) / sampleVector.length;
  const rmsVal = Math.sqrt(rmsSquareMean + eps);
  const normalizedVector = sampleVector.map(v => (v / rmsVal) * sampleScaleGamma);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>⚖️</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              RMSNorm (均方根归一化) 算子原理与数学推导
            </h2>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid #38BDF8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Root Mean Square Layer Normalization
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            深入剖析 Kimi K3 93 层主干网络每层输入端的 RMSNorm 算子：相比传统 LayerNorm 舍弃均值减法 ($-\mu$) 提升 15%~30% GPU 算力效率
          </p>
        </div>

        {/* Navigation Tabs */}
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
            1. 数学公式与计算流
          </button>
          <button
            onClick={() => setActiveTab('stepByStep')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'stepByStep' ? '#A78BFA' : 'transparent',
              color: activeTab === 'stepByStep' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            2. 逐元素推导控制台
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'comparison' ? '#10B981' : 'transparent',
              color: activeTab === 'comparison' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            3. RMSNorm vs LayerNorm 性能对比
          </button>
        </div>
      </div>

      {/* TAB 1: FORMULA & MATHEMATICAL COMPUTATION FLOW */}
      {activeTab === 'formula' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Formula Card */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#38BDF8', margin: 0, fontWeight: 'bold' }}>
              📐 RMSNorm 核心定义公式 (Mathematical Definition)
            </h3>
            
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '1.2rem', color: '#FFF', textAlign: 'center' }}>
              y_i = (x_i / RMS(x)) · γ_i = (x_i / √( Σ x_j² / d + ε )) · γ_i
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#38BDF8', fontWeight: 'bold' }}>x_i ∈ ℝ^(7,168)</span>
                <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '4px 0 0 0' }}>输入向量的第 i 个特征维度数值</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#A78BFA', fontWeight: 'bold' }}>RMS(x) 均方根</span>
                <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '4px 0 0 0' }}>向量模长缩放因子，衡量整体方差激活压强</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#10B981', fontWeight: 'bold' }}>γ_i ∈ ℝ^(7,168)</span>
                <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '4px 0 0 0' }}>可学习的维度缩放增益向量 (Gain Vector)</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>ε = 1e-5</span>
                <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '4px 0 0 0' }}>防止除零的数值稳定性微小偏移量</p>
              </div>
            </div>
          </div>

          {/* SVG Operator Diagram */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 800 240" width="100%" height="240" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-rmsnorm" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38BDF8" />
                </marker>
              </defs>

              {/* Input x_t */}
              <rect x="20" y="80" width="140" height="80" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
              <text x="90" y="115" fill="#38BDF8" fontSize="15" fontWeight="bold" textAnchor="middle">Input x_t</text>
              <text x="90" y="138" fill="#94A3B8" fontSize="13" fontFamily="monospace" textAnchor="middle">ℝ^(7,168)</text>

              <line x1="160" y1="120" x2="220" y2="120" stroke="#38BDF8" strokeWidth="2" markerEnd="url(#arrow-rmsnorm)" />

              {/* Square Sum & RMS Branch */}
              <rect x="220" y="40" width="200" height="60" rx="6" fill="#0F172A" stroke="#A78BFA" strokeWidth="1.5" />
              <text x="320" y="68" fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle">1. 平方求和 (Square Sum)</text>
              <text x="320" y="86" fill="#94A3B8" fontSize="12" fontFamily="monospace" textAnchor="middle">Σ x_j^2 / d</text>

              <rect x="220" y="140" width="200" height="60" rx="6" fill="#0F172A" stroke="#A78BFA" strokeWidth="1.5" />
              <text x="320" y="168" fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle">2. 开方求逆 (1 / RMS)</text>
              <text x="320" y="186" fill="#94A3B8" fontSize="12" fontFamily="monospace" textAnchor="middle">1 / √(Mean + ε)</text>

              <line x1="420" y1="70" x2="470" y2="105" stroke="#A78BFA" strokeWidth="1.5" />
              <line x1="420" y1="170" x2="470" y2="135" stroke="#A78BFA" strokeWidth="1.5" />

              {/* Scale乘法 */}
              <circle cx="500" cy="120" r="28" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="2" />
              <text x="500" y="126" fill="#38BDF8" fontSize="18" fontWeight="bold" textAnchor="middle">⊙</text>

              <line x1="528" y1="120" x2="580" y2="120" stroke="#38BDF8" strokeWidth="2" markerEnd="url(#arrow-rmsnorm)" />

              {/* Multiply Gamma Weight */}
              <rect x="580" y="80" width="180" height="80" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
              <text x="670" y="115" fill="#FFF" fontSize="15" fontWeight="bold" textAnchor="middle">Normalized y_t</text>
              <text x="670" y="138" fill="#10B981" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">y_i = (x_i / RMS) · γ_i</text>
            </svg>
          </div>
        </div>
      )}

      {/* TAB 2: STEP BY STEP INTERACTIVE NUMERICAL SIMULATOR */}
      {activeTab === 'stepByStep' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#A78BFA', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🧪 8 维样本向量逐元素 RMSNorm 实时运算控制台
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              通过改变全局 Gain 参数 $\gamma$ 与稳定性参数 $\epsilon$，观察原始输入向量如何被标准化收敛。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
            {/* Left Controls */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>控制参数调节 (Control Sliders)</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>Gain 缩放因子 γ:</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>{sampleScaleGamma.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={sampleScaleGamma}
                  onChange={(e) => setSampleScaleGamma(parseFloat(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>Epsilon 数值稳定项 ε:</span>
                  <span style={{ color: '#F59E0B', fontWeight: 'bold', fontFamily: 'monospace' }}>{eps.toExponential(1)}</span>
                </div>
                <select
                  value={eps}
                  onChange={(e) => setEps(parseFloat(e.target.value))}
                  style={{ background: '#0F172A', color: '#FFF', border: '1px solid #475569', padding: '6px', borderRadius: '4px' }}
                >
                  <option value={1e-5}>1e-5 (标准推荐值)</option>
                  <option value={1e-6}>1e-6</option>
                  <option value={1e-4}>1e-4</option>
                </select>
              </div>

              {/* Calculated RMS Info */}
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>计算中间值 RMS(x):</span>
                <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                  √( {rmsSquareMean.toFixed(4)} + {eps} ) = {rmsVal.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Right: Numerical Table Comparison */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>8 维度输入与归一化输出数值对照表</span>
              
              <div style={{ display: 'grid', gridTemplateColumns: '80px 120px 120px 140px', gap: '8px', marginTop: '12px', fontSize: '1.02rem' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0', fontWeight: 'bold', paddingBottom: '6px' }}>维度 Index</div>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#38BDF8', fontWeight: 'bold', paddingBottom: '6px' }}>原始数值 x_i</div>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#A78BFA', fontWeight: 'bold', paddingBottom: '6px' }}>无缩放 x_i / RMS</div>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#10B981', fontWeight: 'bold', paddingBottom: '6px' }}>最终输出 y_i (×γ)</div>

                {sampleVector.map((val, idx) => {
                  const unscaled = val / rmsVal;
                  const finalVal = normalizedVector[idx];
                  return (
                    <React.Fragment key={idx}>
                      <div style={{ fontFamily: 'monospace', color: '#94A3B8' }}>Dim [{idx}]</div>
                      <div style={{ fontFamily: 'monospace', color: '#38BDF8' }}>{val.toFixed(2)}</div>
                      <div style={{ fontFamily: 'monospace', color: '#A78BFA' }}>{unscaled.toFixed(4)}</div>
                      <div style={{ fontFamily: 'monospace', color: '#10B981', fontWeight: 'bold' }}>{finalVal.toFixed(4)}</div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RMSNORM VS LAYERNORM COMPARISON */}
      {activeTab === 'comparison' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10B981', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              ⚡ 为什么 Kimi K3 全全面采用 RMSNorm 替换传统 LayerNorm？
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              研究表明，LayerNorm 中的**均值偏移减法（$-\mu$）对防止激活爆发并没有实质贡献**，而核心的控制力全来自于**均方根模长缩放**。RMSNorm 移除了均值计算，在 GPU 显存带宽上节省了二次 Memory Pass！
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* LayerNorm Box */}
            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '1.1rem' }}>❌ 传统 LayerNorm (Layer Normalization)</span>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.95rem', color: '#FFF' }}>
                y_i = ((x_i - μ) / √(σ² + ε)) · γ_i + β_i
              </div>
              <ul style={{ fontSize: '0.98rem', color: '#94A3B8', paddingLeft: '20px', lineHeight: '1.6', margin: 0 }}>
                <li>需要先计算均值 μ = (Σ x_i) / d；</li>
                <li>再计算方差 σ² = (Σ (x_i - μ)²) / d；</li>
                <li>在 GPU Kernel 中需要 <b>两次全局 Reduction 操作</b>，造成额外的 SRAM/DRAM 内存读写延迟。</li>
              </ul>
            </div>

            {/* RMSNorm Box */}
            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid #10B981', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.1rem' }}>✅ Kimi K3 采用的 RMSNorm</span>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.95rem', color: '#FFF' }}>
                y_i = (x_i / √( (Σ x_j²) / d + ε )) · γ_i
              </div>
              <ul style={{ fontSize: '0.98rem', color: '#94A3B8', paddingLeft: '20px', lineHeight: '1.6', margin: 0 }}>
                <li>完全跳过均值 $\mu$ 计算与减法操作；</li>
                <li>只需要 **一次** 平方求和 Reduction 操作；</li>
                <li>在 93 层大模型深度拓扑下，算子耗时减少 **15%~30%**，极大缓解内存带宽瓶颈！</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
