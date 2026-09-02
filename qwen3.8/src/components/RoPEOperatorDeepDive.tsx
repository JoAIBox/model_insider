import React, { useState } from 'react';

export const RoPEOperatorDeepDive: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geometry' | 'pipeline' | 'relative' | 'decouple'>('geometry');
  
  // Tab 1: Interactive rotation angle
  const [tokenPos, setTokenPos] = useState<number>(3);
  const [freqIdx, setFreqIdx] = useState<number>(0); // which frequency pair to highlight
  // Tab 3: Relative position demo
  const [queryPos, setQueryPos] = useState<number>(5);
  const [keyPos, setKeyPos] = useState<number>(2);

  const baseThetas = [1.0, 0.1, 0.01, 0.001]; // Simplified frequency set for visualization
  const thetaLabels = ['θ₀ = 1.0 (高频)', 'θ₁ = 0.1', 'θ₂ = 0.01', 'θ₃ = 0.001 (低频)'];

  // Helper: compute rotation coordinates for visualization
  const rotatedPoint = (x: number, y: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      rx: x * Math.cos(rad) - y * Math.sin(rad),
      ry: x * Math.sin(rad) + y * Math.cos(rad),
    };
  };

  const tabButtonStyle = (tab: string, color: string) => ({
    padding: '8px 14px',
    borderRadius: '6px',
    border: 'none',
    background: activeTab === tab ? color : 'transparent',
    color: activeTab === tab ? '#000' : '#94A3B8',
    fontWeight: 'bold' as const,
    fontSize: '0.95rem',
    cursor: 'pointer' as const,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🧭</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              RoPE (Rotary Position Embedding) 旋转位置编码——全图形解密
            </h2>
            <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid #F59E0B', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Complex Plane Rotation
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            用<b>复平面旋转几何动画</b>与<b>维度追踪流程图</b>彻底拆解 RoPE 如何编码位置信息，以及为什么 MLA 必须将 RoPE 独立解耦拼接！
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setActiveTab('geometry')} style={tabButtonStyle('geometry', 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)')}>
            1. 🧭 复平面旋转几何
          </button>
          <button onClick={() => setActiveTab('pipeline')} style={tabButtonStyle('pipeline', '#A78BFA')}>
            2. ⚙️ 完整计算流程图
          </button>
          <button onClick={() => setActiveTab('relative')} style={tabButtonStyle('relative', '#38BDF8')}>
            3. 🎯 相对位置感知证明
          </button>
          <button onClick={() => setActiveTab('decouple')} style={tabButtonStyle('decouple', '#10B981')}>
            4. 🔗 MLA 解耦拼接原理
          </button>
        </div>
      </div>

      {/* ====================== TAB 1: COMPLEX PLANE ROTATION GEOMETRY ====================== */}
      {activeTab === 'geometry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#F59E0B', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              首先回答核心困惑：RoPE 旋转位置编码与 512 维语义隐向量的关系是什么？64 维从何而来？
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0, lineHeight: '1.6' }}>
              <b style={{ color: '#EF4444' }}>RoPE 完全不触碰 512 维语义隐向量！</b>它们是从同一个 7,168 维输入 x_t 出发的<b>两条完全独立的投影路径</b>。
              512 维纯语义向量保持"干净"（不旋转），而 64 维是通过<b>另一个独立矩阵 W_kr</b> 投影出来的专属位置向量，只有这 64 维会被施加 RoPE 旋转。
              最终两者<b>拼接 (Concatenation)</b> 成 576 维存入 KV Cache。
            </p>
          </div>

          {/* SECTION A: Architecture Origin Diagram — Where does 512d and 64d come from? */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            
            <h4 style={{ color: '#FFF', margin: 0, fontSize: '1.1rem', fontWeight: 'bold', alignSelf: 'flex-start' }}>
              🏗️ 架构来源图：512 维与 64 维是怎样从 7,168 维输入中产生的？
            </h4>

            <svg viewBox="0 0 920 340" width="100%" height="340" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-rope-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#A78BFA" />
                </marker>
                <marker id="arrow-rope-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F59E0B" />
                </marker>
              </defs>

              {/* INPUT: x_t ∈ ℝ^7168 */}
              <rect x="20" y="120" width="120" height="80" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="2.5" />
              <text x="80" y="152" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">输入 x_t</text>
              <text x="80" y="175" fill="#FFF" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">ℝ^7,168</text>

              {/* TWO INDEPENDENT BRANCHES SPLIT */}
              <path d="M 140 145 C 200 145, 200 80, 260 80" stroke="#A78BFA" strokeWidth="2.5" fill="none" markerEnd="url(#arrow-rope-purple)" />
              <path d="M 140 175 C 200 175, 200 250, 260 250" stroke="#F59E0B" strokeWidth="2.5" fill="none" markerEnd="url(#arrow-rope-amber)" />
              
              <text x="185" y="100" fill="#94A3B8" fontSize="11" fontWeight="bold" textAnchor="middle">独立路径 A</text>
              <text x="185" y="240" fill="#94A3B8" fontSize="11" fontWeight="bold" textAnchor="middle">独立路径 B</text>

              {/* PATH A: Semantic Latent — W_dkv projection, NO ROPE */}
              <rect x="260" y="45" width="200" height="70" rx="8" fill="rgba(167, 139, 250, 0.15)" stroke="#A78BFA" strokeWidth="2" />
              <text x="360" y="72" fill="#A78BFA" fontSize="13" fontWeight="bold" textAnchor="middle">语义投影矩阵 W_dkv</text>
              <text x="360" y="92" fill="#94A3B8" fontSize="11" fontFamily="monospace" textAnchor="middle">[512 × 7168] 线性投影</text>

              <line x1="460" y1="80" x2="520" y2="80" stroke="#A78BFA" strokeWidth="2" markerEnd="url(#arrow-rope-purple)" />

              <rect x="520" y="50" width="160" height="60" rx="8" fill="rgba(167, 139, 250, 0.2)" stroke="#A78BFA" strokeWidth="2.5" />
              <text x="600" y="75" fill="#A78BFA" fontSize="13" fontWeight="bold" textAnchor="middle">c_t^KV ∈ ℝ^512</text>
              <text x="600" y="95" fill="#94A3B8" fontSize="10" textAnchor="middle">纯语义 · 完全不施加 RoPE 旋转!</text>

              {/* BIG RED X on Path A — NO ROPE HERE */}
              <circle cx="700" cy="80" r="14" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="2" />
              <text x="700" y="86" fill="#EF4444" fontSize="16" fontWeight="bold" textAnchor="middle">✗</text>
              <text x="700" y="55" fill="#EF4444" fontSize="10" fontWeight="bold" textAnchor="middle">禁止 RoPE!</text>

              {/* PATH B: Positional Key — W_kr projection, THEN ROPE ROTATION */}
              <rect x="260" y="215" width="200" height="70" rx="8" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="2" />
              <text x="360" y="242" fill="#F59E0B" fontSize="13" fontWeight="bold" textAnchor="middle">位置投影矩阵 W_kr</text>
              <text x="360" y="262" fill="#94A3B8" fontSize="11" fontFamily="monospace" textAnchor="middle">[64 × 7168] 线性投影</text>

              <line x1="460" y1="250" x2="520" y2="250" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-rope-amber)" />

              <rect x="520" y="220" width="100" height="60" rx="8" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="1.5" />
              <text x="570" y="245" fill="#F59E0B" fontSize="12" fontWeight="bold" textAnchor="middle">ℝ^64 向量</text>
              <text x="570" y="262" fill="#94A3B8" fontSize="10" textAnchor="middle">(旋转前)</text>

              <line x1="620" y1="250" x2="660" y2="250" stroke="#F59E0B" strokeWidth="2" />

              {/* ROPE ROTATION APPLIED */}
              <rect x="660" y="220" width="120" height="60" rx="8" fill="rgba(245, 158, 11, 0.3)" stroke="#F59E0B" strokeWidth="2.5" />
              <text x="720" y="243" fill="#F59E0B" fontSize="13" fontWeight="bold" textAnchor="middle">🧭 RoPE 旋转</text>
              <text x="720" y="262" fill="#FFF" fontSize="10" fontFamily="monospace" textAnchor="middle">R(m · θ_i)</text>

              <line x1="780" y1="250" x2="810" y2="250" stroke="#F59E0B" strokeWidth="2" />

              <rect x="810" y="225" width="100" height="50" rx="6" fill="#F59E0B" />
              <text x="860" y="248" fill="#000" fontSize="12" fontWeight="bold" textAnchor="middle">k_t^R ∈ ℝ^64</text>
              <text x="860" y="264" fill="rgba(0,0,0,0.6)" fontSize="9" textAnchor="middle">已含位置信息!</text>

              {/* CONCATENATION BRACKET */}
              <path d="M 680 110 L 700 110 L 700 215" stroke="#10B981" strokeWidth="2" fill="none" strokeDasharray="5,3" />
              <path d="M 680 215 L 700 215" stroke="#10B981" strokeWidth="2" fill="none" />

              {/* KV Cache Storage Box */}
              <rect x="730" y="130" width="180" height="80" rx="8" fill="rgba(16, 185, 129, 0.1)" stroke="#10B981" strokeWidth="2" strokeDasharray="5,3" />
              <text x="820" y="152" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle">💾 KV Cache 存储</text>
              <text x="820" y="175" fill="#FFF" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">[c_t^KV ‖ k_t^R]</text>
              <text x="820" y="195" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">512 + 64 = 576 维 (拼接!)</text>

            </svg>

            {/* Dimension Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%' }}>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #A78BFA' }}>
                <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '0.95rem' }}>路径 A: 纯语义隐向量</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem', marginTop: '4px' }}>c_t^KV ∈ ℝ^512</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>由 W_dkv [512×7168] 投影，<b style={{ color: '#EF4444' }}>不施加任何 RoPE</b>，保持"干净"以支持矩阵吸收</p>
              </div>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #F59E0B' }}>
                <span style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '0.95rem' }}>路径 B: RoPE 位置 Key</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem', marginTop: '4px' }}>k_t^R ∈ ℝ^64</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>由<b>独立</b>的 W_kr [64×7168] 投影，然后施加 RoPE 旋转 R(mθ)，64维 = 32对 × 2D旋转</p>
              </div>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #10B981' }}>
                <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.95rem' }}>KV Cache 最终存储</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem', marginTop: '4px' }}>[c_t^KV ‖ k_t^R] = 576d</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>两条路径的输出<b>拼接</b>（非叠加），互不干扰、互不污染</p>
              </div>
            </div>

          </div>

          {/* SECTION B: RoPE Rotation Mechanics — How does the 64d rotation work? */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <h4 style={{ color: '#F59E0B', margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
              🧭 RoPE 旋转原理：这 64 维是怎样编码位置信息的？
            </h4>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
              64 维向量被两两配对为 <b>32 对复数</b>，每对维度 (x₁, x₂) 看作复平面上的一个点。根据 Token 的位置 m，每对施加不同频率 θ_i 的 2D 旋转。拖动滑块观察旋转效果！
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#070913', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '6px' }}>
                <span style={{ color: '#94A3B8' }}>Token 位置 m:</span>
                <span style={{ color: '#F59E0B', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem' }}>{tokenPos}</span>
              </div>
              <input type="range" min="0" max="20" step="1" value={tokenPos} onChange={(e) => setTokenPos(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div style={{ background: '#070913', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '6px' }}>
                <span style={{ color: '#94A3B8' }}>频率维度对:</span>
                <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '0.95rem' }}>{thetaLabels[freqIdx]}</span>
              </div>
              <input type="range" min="0" max="3" step="1" value={freqIdx} onChange={(e) => setFreqIdx(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
          </div>

          {/* Interactive SVG: Complex Plane Rotation */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
            
            {/* LEFT: Complex plane circle */}
            <svg viewBox="-160 -160 320 320" width="320" height="320" style={{ flexShrink: 0 }}>
              {/* Grid */}
              <line x1="-140" y1="0" x2="140" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1="0" y1="-140" x2="0" y2="140" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <text x="145" y="5" fill="#94A3B8" fontSize="12">Re</text>
              <text x="5" y="-142" fill="#94A3B8" fontSize="12">Im</text>

              {/* Unit circle */}
              <circle cx="0" cy="0" r="100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

              {/* Original vector (before rotation) */}
              {(() => {
                const origX = 70, origY = -50; // Original (x1, x2) mapped to canvas
                const angleDeg = tokenPos * baseThetas[freqIdx] * (180 / Math.PI) * 10; // scale for visibility
                const { rx, ry } = rotatedPoint(origX, origY, -angleDeg); // SVG y-axis is inverted
                return (
                  <g>
                    {/* Rotation arc */}
                    {angleDeg > 0 && (
                      <path
                        d={`M ${origX * 0.4} ${origY * 0.4} A 30 30 0 ${Math.abs(angleDeg) > 180 ? 1 : 0} ${angleDeg > 0 ? 0 : 1} ${rx * 0.4} ${ry * 0.4}`}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="1.5"
                        strokeDasharray="3,2"
                      />
                    )}
                    
                    {/* Original vector (gray) */}
                    <line x1="0" y1="0" x2={origX} y2={origY} stroke="#64748B" strokeWidth="2" />
                    <circle cx={origX} cy={origY} r="5" fill="#64748B" />
                    <text x={origX + 8} y={origY - 5} fill="#94A3B8" fontSize="11" fontWeight="bold">旋转前 (x₁, x₂)</text>

                    {/* Rotated vector (yellow) */}
                    <line x1="0" y1="0" x2={rx} y2={ry} stroke="#F59E0B" strokeWidth="2.5" />
                    <circle cx={rx} cy={ry} r="6" fill="#F59E0B" />
                    <text x={rx + 8} y={ry - 5} fill="#F59E0B" fontSize="11" fontWeight="bold">旋转后 (x₁', x₂')</text>

                    {/* Angle annotation */}
                    <text x="-10" y="135" fill="#F59E0B" fontSize="12" fontWeight="bold" textAnchor="middle">
                      旋转角 = m · θ_{freqIdx} = {(angleDeg).toFixed(1)}°
                    </text>
                  </g>
                );
              })()}
            </svg>

            {/* RIGHT: Rotation Matrix Formula & Explanation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              
              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <h4 style={{ color: '#F59E0B', margin: '0 0 10px 0', fontSize: '1.1rem' }}>2D 旋转矩阵 (对 64 维中的每一对施加)</h4>
                <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: '#FFF', lineHeight: '1.8', background: '#070913', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#94A3B8' }}>┌</span>
                    <span>x₁'</span>
                    <span style={{ color: '#94A3B8' }}>┐</span>
                    <span style={{ color: '#94A3B8', margin: '0 6px' }}>=</span>
                    <span style={{ color: '#94A3B8' }}>┌</span>
                    <span style={{ color: '#38BDF8' }}>cos(mθ)</span>
                    <span style={{ color: '#EF4444', margin: '0 4px' }}>−sin(mθ)</span>
                    <span style={{ color: '#94A3B8' }}>┐</span>
                    <span style={{ color: '#94A3B8', margin: '0 6px' }}>·</span>
                    <span style={{ color: '#94A3B8' }}>┌</span>
                    <span>x₁</span>
                    <span style={{ color: '#94A3B8' }}>┐</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#94A3B8' }}>└</span>
                    <span>x₂'</span>
                    <span style={{ color: '#94A3B8' }}>┘</span>
                    <span style={{ color: '#94A3B8', margin: '0 6px' }}>&nbsp;</span>
                    <span style={{ color: '#94A3B8' }}>└</span>
                    <span style={{ color: '#EF4444' }}>sin(mθ)</span>
                    <span style={{ color: '#38BDF8', margin: '0 4px' }}>&nbsp;cos(mθ)</span>
                    <span style={{ color: '#94A3B8' }}>┘</span>
                    <span style={{ color: '#94A3B8', margin: '0 6px' }}>&nbsp;</span>
                    <span style={{ color: '#94A3B8' }}>└</span>
                    <span>x₂</span>
                    <span style={{ color: '#94A3B8' }}>┘</span>
                  </div>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: '8px 0 0 0' }}>
                  64 维 = 32 对 × 2D 旋转。每对使用不同频率 θ_i，高频对捕捉邻近 Token 关系，低频对捕捉万级距离依赖。
                </p>
              </div>

              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ color: '#38BDF8', margin: '0 0 8px 0', fontSize: '1.05rem' }}>多频率设计：为什么需要不同的 θ_i？</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {thetaLabels.map((label, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', borderRadius: '4px',
                      background: freqIdx === i ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                      border: freqIdx === i ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                      cursor: 'pointer'
                    }} onClick={() => setFreqIdx(i)}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: freqIdx === i ? '#F59E0B' : '#64748B' }} />
                      <span style={{ color: freqIdx === i ? '#F59E0B' : '#94A3B8', fontSize: '0.95rem', fontFamily: 'monospace' }}>
                        维度对 {i}: {label}
                      </span>
                      <span style={{ color: '#94A3B8', fontSize: '0.85rem', marginLeft: 'auto' }}>
                        {i === 0 ? '→ 快速旋转，捕捉近邻' : i === 3 ? '→ 极慢旋转，捕捉远距离' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <span style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '0.95rem' }}>Kimi K3 频率公式：</span>
                <span style={{ color: '#FFF', fontFamily: 'monospace', fontSize: '0.95rem', marginLeft: '8px' }}>
                  θ_i = base^(−2i / d_rope), base = 10,000, d_rope = 64, i = 0,1,...,31
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ====================== TAB 2: COMPLETE COMPUTATION PIPELINE ====================== */}
      {activeTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#A78BFA', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              完整计算流程：从输入向量到旋转后向量的每一步维度变化
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0, lineHeight: '1.5' }}>
              以 Kimi K3 的 Query/Key 向量（每头 128 维）为例，完整追踪 RoPE 如何在每一步变换数据！
            </p>
          </div>

          {/* SVG Pipeline Diagram */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            
            <svg viewBox="0 0 960 420" width="100%" height="420" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-pipe-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#A78BFA" />
                </marker>
                <marker id="arrow-pipe-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F59E0B" />
                </marker>
              </defs>

              {/* STEP 1: Input Query/Key Vector */}
              <g>
                <rect x="20" y="30" width="180" height="70" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                <text x="110" y="58" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">Step 1: 输入向量</text>
                <text x="110" y="80" fill="#FFF" fontSize="12" fontFamily="monospace" textAnchor="middle">q ∈ ℝ^128 (单头 Query)</text>
                <text x="110" y="110" fill="#94A3B8" fontSize="11" textAnchor="middle">[q₀, q₁, q₂, q₃, ..., q₁₂₆, q₁₂₇]</text>
              </g>

              {/* Arrow down */}
              <line x1="110" y1="100" x2="110" y2="150" stroke="#A78BFA" strokeWidth="2" markerEnd="url(#arrow-pipe-purple)" />

              {/* STEP 2: Pair Grouping */}
              <g>
                <rect x="20" y="150" width="180" height="80" rx="8" fill="rgba(167, 139, 250, 0.1)" stroke="#A78BFA" strokeWidth="2" />
                <text x="110" y="178" fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle">Step 2: 两两配对</text>
                <text x="110" y="198" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">128 维 → 64 对复数</text>
                <text x="110" y="218" fill="#94A3B8" fontSize="10" textAnchor="middle">(q₀,q₁), (q₂,q₃), ..., (q₁₂₆,q₁₂₇)</text>
              </g>

              {/* Arrow down */}
              <line x1="110" y1="230" x2="110" y2="280" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-pipe-amber)" />

              {/* STEP 3: Apply per-pair rotation */}
              <g>
                <rect x="20" y="280" width="180" height="80" rx="8" fill="rgba(245, 158, 11, 0.1)" stroke="#F59E0B" strokeWidth="2" />
                <text x="110" y="308" fill="#F59E0B" fontSize="14" fontWeight="bold" textAnchor="middle">Step 3: 逐对旋转</text>
                <text x="110" y="328" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">每对施加 R(m · θ_i)</text>
                <text x="110" y="348" fill="#94A3B8" fontSize="10" textAnchor="middle">64 对 × 不同频率 θ_i</text>
              </g>

              {/* RIGHT SIDE: Expanded Pair Rotation Detail */}
              {/* Pair 0 */}
              <g>
                <rect x="280" y="40" width="300" height="80" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="430" y="62" fill="#F59E0B" fontSize="12" fontWeight="bold" textAnchor="middle">维度对 0: (q₀, q₁) → 旋转角 m · θ₀</text>
                <text x="430" y="82" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">q₀' = q₀·cos(mθ₀) − q₁·sin(mθ₀)</text>
                <text x="430" y="100" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">q₁' = q₀·sin(mθ₀) + q₁·cos(mθ₀)</text>
                <text x="590" y="62" fill="#94A3B8" fontSize="10">θ₀ = 10000⁰ = 1</text>
              </g>

              {/* Pair 1 */}
              <g>
                <rect x="280" y="140" width="300" height="80" rx="6" fill="#0F172A" stroke="#A78BFA" strokeWidth="1.5" />
                <text x="430" y="162" fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">维度对 1: (q₂, q₃) → 旋转角 m · θ₁</text>
                <text x="430" y="182" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">q₂' = q₂·cos(mθ₁) − q₃·sin(mθ₁)</text>
                <text x="430" y="200" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">q₃' = q₂·sin(mθ₁) + q₃·cos(mθ₁)</text>
                <text x="590" y="162" fill="#94A3B8" fontSize="10">θ₁ = 10000^(−1/64)</text>
              </g>

              {/* Ellipsis */}
              <text x="430" y="250" fill="#94A3B8" fontSize="20" fontWeight="bold" textAnchor="middle">⋮</text>

              {/* Pair 63 */}
              <g>
                <rect x="280" y="270" width="300" height="80" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
                <text x="430" y="292" fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle">维度对 63: (q₁₂₆, q₁₂₇) → 旋转角 m · θ₆₃</text>
                <text x="430" y="312" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">q₁₂₆' = q₁₂₆·cos(mθ₆₃) − q₁₂₇·sin(mθ₆₃)</text>
                <text x="430" y="330" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">q₁₂₇' = q₁₂₆·sin(mθ₆₃) + q₁₂₇·cos(mθ₆₃)</text>
                <text x="590" y="292" fill="#94A3B8" fontSize="10">θ₆₃ ≈ 10⁻⁵ (极慢)</text>
              </g>

              {/* Connecting lines from pairs to output */}
              <line x1="580" y1="80" x2="660" y2="80" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="580" y1="180" x2="660" y2="180" stroke="#A78BFA" strokeWidth="1.5" />
              <line x1="580" y1="310" x2="660" y2="310" stroke="#10B981" strokeWidth="1.5" />

              {/* OUTPUT: Reassembled Rotated Vector */}
              <g>
                <rect x="660" y="40" width="280" height="330" rx="8" fill="rgba(16, 185, 129, 0.08)" stroke="#10B981" strokeWidth="2" />
                <text x="800" y="70" fill="#10B981" fontSize="15" fontWeight="bold" textAnchor="middle">Step 4: 重组输出</text>
                <text x="800" y="95" fill="#FFF" fontSize="12" fontFamily="monospace" textAnchor="middle">R_m · q ∈ ℝ^128</text>

                <text x="800" y="130" fill="#F59E0B" fontSize="11" fontFamily="monospace" textAnchor="middle">[q₀', q₁',</text>
                <text x="800" y="175" fill="#A78BFA" fontSize="11" fontFamily="monospace" textAnchor="middle">q₂', q₃',</text>
                <text x="800" y="220" fill="#94A3B8" fontSize="14" textAnchor="middle">...</text>
                <text x="800" y="265" fill="#10B981" fontSize="11" fontFamily="monospace" textAnchor="middle">q₁₂₆', q₁₂₇']</text>

                <text x="800" y="310" fill="#94A3B8" fontSize="11" textAnchor="middle">维度数量不变：128 维</text>
                <text x="800" y="330" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">但每对维度编码了位置 m 的信息!</text>
                <text x="800" y="355" fill="#94A3B8" fontSize="10" textAnchor="middle">高频维度对编码近距离关系</text>
                <text x="800" y="370" fill="#94A3B8" fontSize="10" textAnchor="middle">低频维度对编码长距离关系</text>
              </g>

            </svg>

            {/* Key Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', width: '100%' }}>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #38BDF8' }}>
                <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '0.9rem' }}>输入维度</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem', marginTop: '4px' }}>q ∈ ℝ^128</div>
              </div>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #A78BFA' }}>
                <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '0.9rem' }}>配对数量</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem', marginTop: '4px' }}>64 对复数</div>
              </div>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #F59E0B' }}>
                <span style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '0.9rem' }}>旋转角度</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem', marginTop: '4px' }}>m · θ_i (各不相同)</div>
              </div>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #10B981' }}>
                <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.9rem' }}>输出维度</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem', marginTop: '4px' }}>R_m·q ∈ ℝ^128</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ====================== TAB 3: RELATIVE POSITION AWARENESS PROOF ====================== */}
      {activeTab === 'relative' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#38BDF8', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              核心证明：旋转自动抵消，点积只依赖相对位置 (n − m)
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0, lineHeight: '1.5' }}>
              当位置 m 的 Query 与位置 n 的 Key 做内积时，两个旋转矩阵神奇地合并为一个只依赖<b>相对距离 (n−m)</b> 的旋转！拖动滑块观察两个向量在复平面上的旋转与点积变化！
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#070913', padding: '14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '6px' }}>
                <span style={{ color: '#94A3B8' }}>Query 位置 m:</span>
                <span style={{ color: '#38BDF8', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem' }}>{queryPos}</span>
              </div>
              <input type="range" min="0" max="20" step="1" value={queryPos} onChange={(e) => setQueryPos(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div style={{ background: '#070913', padding: '14px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '6px' }}>
                <span style={{ color: '#94A3B8' }}>Key 位置 n:</span>
                <span style={{ color: '#A78BFA', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem' }}>{keyPos}</span>
              </div>
              <input type="range" min="0" max="20" step="1" value={keyPos} onChange={(e) => setKeyPos(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
          </div>

          {/* SVG: Two vectors rotating and meeting */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '30px', alignItems: 'center' }}>
            
            <svg viewBox="-160 -160 320 320" width="300" height="300" style={{ flexShrink: 0 }}>
              {/* Grid & Circle */}
              <line x1="-140" y1="0" x2="140" y2="0" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="0" y1="-140" x2="0" y2="140" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <circle cx="0" cy="0" r="100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

              {(() => {
                const qAngle = queryPos * 30; // degrees for visibility
                const kAngle = keyPos * 30;
                const qRad = (qAngle * Math.PI) / 180;
                const kRad = (kAngle * Math.PI) / 180;
                const qx = 90 * Math.cos(-qRad), qy = 90 * Math.sin(-qRad);
                const kx = 90 * Math.cos(-kRad), ky = 90 * Math.sin(-kRad);
                const relAngle = (keyPos - queryPos) * 30;

                return (
                  <g>
                    {/* Query vector */}
                    <line x1="0" y1="0" x2={qx} y2={qy} stroke="#38BDF8" strokeWidth="2.5" />
                    <circle cx={qx} cy={qy} r="6" fill="#38BDF8" />
                    <text x={qx + (qx > 0 ? 8 : -50)} y={qy - 8} fill="#38BDF8" fontSize="12" fontWeight="bold">R_m · q</text>

                    {/* Key vector */}
                    <line x1="0" y1="0" x2={kx} y2={ky} stroke="#A78BFA" strokeWidth="2.5" />
                    <circle cx={kx} cy={ky} r="6" fill="#A78BFA" />
                    <text x={kx + (kx > 0 ? 8 : -50)} y={ky - 8} fill="#A78BFA" fontSize="12" fontWeight="bold">R_n · k</text>

                    {/* Relative angle arc */}
                    <text x="0" y="135" fill="#F59E0B" fontSize="12" fontWeight="bold" textAnchor="middle">
                      相对角度 = (n−m) · θ = {relAngle}°
                    </text>
                  </g>
                );
              })()}
            </svg>

            {/* RIGHT: Mathematical Proof */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              
              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <h4 style={{ color: '#38BDF8', margin: '0 0 10px 0', fontSize: '1.1rem' }}>点积抵消证明 (3 步推导)</h4>
                <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: '#FFF', lineHeight: '2.2', background: '#070913', padding: '12px', borderRadius: '6px' }}>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Step 1:</span>{' '}
                    <span style={{ color: '#38BDF8' }}>⟨R_m · q, R_n · k⟩</span>
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Step 2:</span>{' '}
                    = (R_m · q)ᵀ · (R_n · k) = qᵀ · <span style={{ color: '#F59E0B' }}>R_m</span>ᵀ · <span style={{ color: '#A78BFA' }}>R_n</span> · k
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Step 3:</span>{' '}
                    = qᵀ · <span style={{ color: '#10B981' }}>R_(n−m)</span> · k
                  </div>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: '8px 0 0 0', lineHeight: '1.5' }}>
                  <b>关键</b>：因为旋转矩阵是正交矩阵，R_mᵀ = R_(−m)，所以 R_mᵀ · R_n = R_(n−m)。点积结果只与<b>相对位置 (n−m)</b> 有关！
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#0F172A', padding: '10px', borderRadius: '6px', border: '1px solid #38BDF8', textAlign: 'center' }}>
                  <div style={{ color: '#38BDF8', fontSize: '0.85rem', fontWeight: 'bold' }}>Query 位置</div>
                  <div style={{ color: '#FFF', fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 'bold' }}>m = {queryPos}</div>
                </div>
                <div style={{ background: '#0F172A', padding: '10px', borderRadius: '6px', border: '1px solid #A78BFA', textAlign: 'center' }}>
                  <div style={{ color: '#A78BFA', fontSize: '0.85rem', fontWeight: 'bold' }}>Key 位置</div>
                  <div style={{ color: '#FFF', fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 'bold' }}>n = {keyPos}</div>
                </div>
                <div style={{ background: '#0F172A', padding: '10px', borderRadius: '6px', border: '1px solid #10B981', textAlign: 'center' }}>
                  <div style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 'bold' }}>相对距离</div>
                  <div style={{ color: '#FFF', fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 'bold' }}>n−m = {keyPos - queryPos}</div>
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1rem' }}>
                  🎯 RoPE 的绝妙之处：无论 Query 和 Key 的绝对位置如何变化，它们的注意力得分只由相对距离决定。这赋予模型理论上无限长的上下文外推能力！
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ====================== TAB 4: MLA DECOUPLING - WHY CONCAT NOT ADD ====================== */}
      {activeTab === 'decouple' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10B981', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              MLA 中的关键决策：为什么必须将 RoPE 独立拼接 (64维)，而非叠加进隐向量 (512维)？
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0, lineHeight: '1.5' }}>
              答案在于：叠加会导致<b>矩阵吸收 (Matrix Absorption) 彻底失效</b>！下面用两种方案的对比图展示原因。
            </p>
          </div>

          {/* SVG: Side-by-side comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* LEFT: FAILED - Additive/Mixed RoPE */}
            <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '2px solid #EF4444', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>❌</span>
                <h4 style={{ color: '#EF4444', margin: 0, fontSize: '1.1rem' }}>方案 A: 叠加 RoPE (矩阵吸收崩溃!)</h4>
              </div>

              <svg viewBox="0 0 400 280" width="100%" height="280">
                {/* Query path */}
                <rect x="10" y="20" width="80" height="35" rx="4" fill="#38BDF8" />
                <text x="50" y="42" fill="#000" fontSize="11" fontWeight="bold" textAnchor="middle">q_t^C</text>

                <line x1="90" y1="37" x2="120" y2="37" stroke="#38BDF8" strokeWidth="1.5" />

                <rect x="120" y="15" width="80" height="45" rx="4" fill="rgba(56, 189, 248, 0.2)" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="160" y="42" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle">W_uq · R_m</text>

                <line x1="200" y1="37" x2="230" y2="37" stroke="#38BDF8" strokeWidth="1.5" />

                {/* Key path */}
                <rect x="10" y="80" width="80" height="35" rx="4" fill="#A78BFA" />
                <text x="50" y="102" fill="#000" fontSize="11" fontWeight="bold" textAnchor="middle">c_j^KV</text>

                <line x1="90" y1="97" x2="120" y2="97" stroke="#A78BFA" strokeWidth="1.5" />

                <rect x="120" y="75" width="80" height="45" rx="4" fill="rgba(167, 139, 250, 0.2)" stroke="#A78BFA" strokeWidth="1.5" />
                <text x="160" y="102" fill="#A78BFA" fontSize="10" fontWeight="bold" textAnchor="middle">R_n · W_uk</text>

                <line x1="200" y1="97" x2="230" y2="97" stroke="#A78BFA" strokeWidth="1.5" />

                {/* Dot product */}
                <circle cx="245" cy="67" r="12" fill="#FFB000" />
                <text x="245" y="72" fill="#000" fontSize="14" fontWeight="bold" textAnchor="middle">×</text>

                {/* Score equation */}
                <text x="200" y="160" fill="#FFF" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  Score = qᵀ · W_uq^T · R_m^T · R_n · W_uk · c_j
                </text>

                {/* Highlighted blocking term */}
                <rect x="140" y="170" width="120" height="25" rx="4" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="1.5" />
                <text x="200" y="188" fill="#EF4444" fontSize="10" fontWeight="bold" textAnchor="middle">
                  R_m^T · R_n 夹在中间!
                </text>

                {/* Explanation */}
                <text x="200" y="220" fill="#EF4444" fontSize="10" fontWeight="bold" textAnchor="middle">
                  ⚠ 动态旋转矩阵 R_(n-m) 阻断了
                </text>
                <text x="200" y="238" fill="#EF4444" fontSize="10" fontWeight="bold" textAnchor="middle">
                  W_uq^T 与 W_uk 的提前合并!
                </text>
                <text x="200" y="262" fill="#EF4444" fontSize="10" textAnchor="middle">
                  → 必须将 512d 解压成 12,288d 才能算
                </text>
              </svg>
            </div>

            {/* RIGHT: SUCCESS - Decoupled Concatenation */}
            <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '2px solid #10B981', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>✅</span>
                <h4 style={{ color: '#10B981', margin: 0, fontSize: '1.1rem' }}>方案 B: 拼接解耦 (矩阵吸收完美生效!)</h4>
              </div>

              <svg viewBox="0 0 400 280" width="100%" height="280">
                {/* Semantic Score Path */}
                <text x="200" y="20" fill="#A78BFA" fontSize="11" fontWeight="bold" textAnchor="middle">路径 A: 纯语义 (无旋转)</text>
                
                <rect x="30" y="30" width="65" height="30" rx="4" fill="#38BDF8" />
                <text x="62.5" y="50" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">q_t^C</text>

                <rect x="120" y="25" width="130" height="40" rx="4" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth="1.5" />
                <text x="185" y="50" fill="#10B981" fontSize="10" fontWeight="bold" textAnchor="middle">W_QK = W_uq^T·W_uk^T</text>

                <rect x="275" y="30" width="65" height="30" rx="4" fill="#A78BFA" />
                <text x="307.5" y="50" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">c_j^KV</text>

                <line x1="95" y1="45" x2="120" y2="45" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="250" y1="45" x2="275" y2="45" stroke="#A78BFA" strokeWidth="1.5" />

                <text x="200" y="85" fill="#10B981" fontSize="10" fontWeight="bold" textAnchor="middle">
                  ✓ 静态矩阵，可以提前合并! 零解压!
                </text>

                {/* Divider */}
                <line x1="20" y1="100" x2="380" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,3" />

                {/* Positional Score Path */}
                <text x="200" y="120" fill="#F59E0B" fontSize="11" fontWeight="bold" textAnchor="middle">路径 B: 纯位置 (独立旋转)</text>

                <rect x="30" y="130" width="75" height="30" rx="4" fill="rgba(245, 158, 11, 0.3)" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="67.5" y="150" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle">R_m · q_t^R</text>

                <circle cx="195" cy="145" r="10" fill="#FFB000" />
                <text x="195" y="149" fill="#000" fontSize="12" fontWeight="bold" textAnchor="middle">×</text>

                <rect x="255" y="130" width="85" height="30" rx="4" fill="rgba(245, 158, 11, 0.3)" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="297.5" y="150" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle">R_n · k_j^R</text>

                <line x1="105" y1="145" x2="185" y2="145" stroke="#F59E0B" strokeWidth="1.5" />
                <line x1="205" y1="145" x2="255" y2="145" stroke="#F59E0B" strokeWidth="1.5" />

                <text x="200" y="185" fill="#F59E0B" fontSize="10" textAnchor="middle">
                  → 自动抵消为 R_(n-m)，仅 64 维!
                </text>

                {/* Divider */}
                <line x1="20" y1="200" x2="380" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,3" />

                {/* Final Sum */}
                <text x="200" y="225" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">最终 Attention Score =</text>
                <text x="200" y="248" fill="#10B981" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  (语义得分: q^C · W_QK · c_j^T)
                </text>
                <text x="200" y="265" fill="#F59E0B" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  + (位置得分: q^R · R_(n-m) · k_j^R)
                </text>
              </svg>
            </div>

          </div>

          {/* Bottom Summary Table */}
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ color: '#FFF', margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
              方案对比总结
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#94A3B8' }}>特性</th>
                    <th style={{ padding: '10px', textAlign: 'center', color: '#EF4444' }}>❌ 叠加 RoPE</th>
                    <th style={{ padding: '10px', textAlign: 'center', color: '#10B981' }}>✅ 拼接解耦 (MLA 采用)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px', color: '#94A3B8' }}>支持 RoPE 位置旋转</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#10B981' }}>✅ 支持</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#10B981' }}>✅ 支持</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px', color: '#94A3B8' }}>矩阵吸收 (零解压推理)</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#EF4444', fontWeight: 'bold' }}>❌ 被旋转矩阵阻断</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#10B981', fontWeight: 'bold' }}>✅ 语义路径完美吸收</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px', color: '#94A3B8' }}>推理时 GPU 中间显存</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#EF4444' }}>解压到 12,288 维</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#10B981' }}>保持 512 维，额外仅 64 维</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', color: '#94A3B8' }}>KV Cache 总体积</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#EF4444' }}>24,576 维 (MHA 暴增)</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#10B981', fontWeight: 'bold' }}>576 维 (512+64, 省 42.6 倍!)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
