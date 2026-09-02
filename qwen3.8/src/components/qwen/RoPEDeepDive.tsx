import React, { useState } from 'react';

export const RoPEDeepDive: React.FC = () => {
  const [pos, setPos] = useState<number>(16);
  const [thetaBase, setThetaBase] = useState<number>(1000000);
  const [headDim] = useState<number>(128);
  const [yarnScale, setYarnScale] = useState<number>(4);

  // Compute rotary angles for first 4 dimension pairs
  const dimPairs = [0, 1, 2, 3];
  const freqs = dimPairs.map((i) => 1.0 / Math.pow(thetaBase, (2 * i) / headDim));
  const angles = freqs.map((f) => (pos * f) % (2 * Math.PI));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🔄</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              RoPE (Rotary Position Embedding) 与长上下文扩展
            </h2>
            <span style={{ background: 'rgba(196, 181, 253, 0.15)', color: '#c4b5fd', border: '1px solid #c4b5fd', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Base θ = 1,000,000 · YaRN 1M
            </span>
          </div>
          <p style={{ fontSize: '1rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            RoPE 将绝对位置编码转化为二维平面上的复数旋转，使得查询向量与键向量的点积只依赖于它们的相对位置差 \(m - n\)。Qwen 3.8 采用高达 1,000,000 的 Base Theta 并融合 YaRN 插值，实现高达 1M 极长上下文的零外推退化。
          </p>
        </div>
      </div>

      {/* 2. Innovation Banner */}
      <div style={{ background: 'rgba(196, 181, 253, 0.05)', border: '1px solid rgba(196, 181, 253, 0.3)', borderRadius: '10px', padding: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#c4b5fd', margin: '0 0 10px 0', fontWeight: 'bold' }}>
          ⭐ 创新亮点与长上下文设计动机
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px' }}>
            <strong style={{ color: '#EF4444' }}>❌ 绝对位置编码的痛点</strong>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
              直接将位置向量加到嵌入上（如 BERT/GPT-2），模型无法泛化到训练长度之外的位置，长程相对距离信息衰减严重。
            </p>
          </div>
          <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px' }}>
            <strong style={{ color: '#67e8f9' }}>💡 Base θ = 1,000,000 增大波长</strong>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
              将标准 Llama 的 10,000 提升至 1,000,000，显著拉长高频维度的周期，减缓高维特征在长距离下的相位混叠。
            </p>
          </div>
          <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px' }}>
            <strong style={{ color: '#10B981' }}>✅ YaRN (Yet another RoPE) 动态插值</strong>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
              对高频维度直接外推（保留局部高精感知），对低频维度进行频域平滑插值（适应百万超长序列），实现 262K 到 1M 的无损扩展。
            </p>
          </div>
        </div>
      </div>

      {/* 3. Interactive RoPE Visualizer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        
        {/* Left: SVG 2D Rotation Circles */}
        <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(196, 181, 253, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ color: '#c4b5fd', margin: 0, fontWeight: 'bold' }}>
              二维平面正交旋转模拟 (4 个通道对)
            </h4>
            <span style={{ fontFamily: 'monospace', color: '#67e8f9', fontSize: '0.9rem' }}>
              Position m = {pos}
            </span>
          </div>

          <svg width="100%" height="220" viewBox="0 0 480 220" style={{ background: '#02040a', borderRadius: '8px' }}>
            {dimPairs.map((pairIdx) => {
              const cx = 60 + pairIdx * 115;
              const cy = 110;
              const r = 40;
              const angle = angles[pairIdx];
              const px = cx + r * Math.cos(angle);
              const py = cy - r * Math.sin(angle);

              return (
                <g key={pairIdx}>
                  {/* Axis */}
                  <line x1={cx - r - 5} y1={cy} x2={cx + r + 5} y2={cy} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1={cx} y1={cy - r - 5} x2={cx} y2={cy + r + 5} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  {/* Circle */}
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(196,181,253,0.3)" strokeWidth="1" strokeDasharray="3 3" />
                  {/* Rotated Vector */}
                  <line x1={cx} y1={cy} x2={px} y2={py} stroke="#67e8f9" strokeWidth="2.5" />
                  <circle cx={px} cy={py} r="4" fill="#c4b5fd" />
                  {/* Label */}
                  <text x={cx} y="175" fill="#94A3B8" fontSize="11" textAnchor="middle">
                    维度对 ({2 * pairIdx}, {2 * pairIdx + 1})
                  </text>
                  <text x={cx} y="195" fill="#67e8f9" fontSize="10" fontFamily="monospace" textAnchor="middle">
                    θ = {(angle * 180 / Math.PI).toFixed(1)}°
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Slider controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', width: '90px' }}>Token 位置 m:</span>
              <input
                type="range"
                min="0"
                max="256"
                value={pos}
                onChange={(e) => setPos(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontFamily: 'monospace', color: '#67e8f9', width: '50px', textAlign: 'right' }}>{pos}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', width: '90px' }}>YaRN 扩增倍数:</span>
              <input
                type="range"
                min="1"
                max="16"
                step="1"
                value={yarnScale}
                onChange={(e) => {
                  setYarnScale(Number(e.target.value));
                  setThetaBase(1000000 * Math.pow(Number(e.target.value), headDim / (headDim - 2)));
                }}
                style={{ flex: 1 }}
              />
              <span style={{ fontFamily: 'monospace', color: '#c4b5fd', width: '50px', textAlign: 'right' }}>{yarnScale}× ({32 * yarnScale}K)</span>
            </div>
          </div>
        </div>

        {/* Right: Math & Code */}
        <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ color: '#67e8f9', margin: 0, fontWeight: 'bold' }}>
            📐 数学表达与正交旋转矩阵
          </h4>
          <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.6' }}>
            <div style={{ color: '#67e8f9' }}>// 二维平面旋转分块矩阵 R_Θ,m:</div>
            R_m · x = [ x_0 cos(mθ_0) - x_1 sin(mθ_0),<br />
            {'           '}x_0 sin(mθ_0) + x_1 cos(mθ_0), ... ]<br />
            <div style={{ color: '#c4b5fd', marginTop: '6px' }}>// 相对位置不变性:</div>
            ⟨R_m q, R_n k⟩ = qᵀ R_(n-m) k = g(q, k, m - n)
          </div>
          <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', color: '#94A3B8' }}>
            <strong style={{ color: '#FFF' }}>物理特性保证:</strong>
            <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', lineHeight: '1.5' }}>
              <li>范数保持：旋转矩阵是正交阵，不改变向量的模长 \(||R_m x|| = ||x||\)</li>
              <li>远程衰减：随着相对距离 \(|m-n|\) 增大，注意力权重自然产生内建衰减趋势</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
