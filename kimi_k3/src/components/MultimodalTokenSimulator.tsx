import React, { useState } from 'react';

export const MultimodalTokenSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patchEncoder' | 'pixelShuffle' | 'latentSpace' | 'decoder'>('overview');
  
  // Interactive Prompt State
  const [prefixText, setPrefixText] = useState<string>('Show me this');
  const [suffixText, setSuffixText] = useState<string>('what cat?');
  
  // Interactive Patch selection for Step 2 & 3
  const [selectedPatchGroup, setSelectedPatchGroup] = useState<number>(0);
  
  // Filter inspector selection for Step 2
  const [selectedFilterIdx, setSelectedFilterIdx] = useState<number>(12); // Filter #13: Vertical Edge Detector

  // Reconstructed vs Original opacity slider for Step 5
  const [reconOpacity, setReconOpacity] = useState<number>(85);

  // Sample 4x4 Grid images (4 patches of 14x14)
  const samplePatches = [
    { name: 'Top-Left (Ear Texture)', color: '#FF5555', filterVal: 0.82 },
    { name: 'Top-Right (Sky Background)', color: '#38BDF8', filterVal: 0.15 },
    { name: 'Bottom-Left (Fur Detail)', color: '#10B981', filterVal: 0.94 },
    { name: 'Bottom-Right (Shadow Pattern)', color: '#FFB000', filterVal: 0.61 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🌟</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              Layer 0 多模态 Token 转换与对齐深度交互演示
            </h2>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid #38BDF8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Multimodal Tokenizer Simulator
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            解密离散文本（BPE 查表）与连续图像（MoonViT + Pixel Shuffle + W_proj 矩阵运算）如何统一转换为 7,168 维 Token 向量
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'overview' ? '#38BDF8' : 'transparent',
              color: activeTab === 'overview' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            1. 全流程交互控制台
          </button>
          <button
            onClick={() => setActiveTab('patchEncoder')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'patchEncoder' ? '#A78BFA' : 'transparent',
              color: activeTab === 'patchEncoder' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            2. 588d → 512d 图像编码
          </button>
          <button
            onClick={() => setActiveTab('pixelShuffle')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'pixelShuffle' ? '#10B981' : 'transparent',
              color: activeTab === 'pixelShuffle' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            3. 2×2 Pixel Shuffle (2,048d)
          </button>
          <button
            onClick={() => setActiveTab('latentSpace')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'latentSpace' ? '#F59E0B' : 'transparent',
              color: activeTab === 'latentSpace' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            4. 7,168维 统一高维潜空间
          </button>
          <button
            onClick={() => setActiveTab('decoder')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'decoder' ? '#EC4899' : 'transparent',
              color: activeTab === 'decoder' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            5. 逆向重构还原验证
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & PIPELINE CONSOLE */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Interactive User Input Prompt Settings */}
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#38BDF8', margin: 0, fontWeight: 'bold' }}>
              ✍️ 自定义测试用户提示词 (Interleaved User Prompt)
            </h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.9rem', color: '#94A3B8' }}>前缀文本 (Prefix Text):</label>
                <input
                  type="text"
                  value={prefixText}
                  onChange={(e) => setPrefixText(e.target.value)}
                  style={{ background: '#0F172A', border: '1px solid #38BDF8', color: '#FFF', padding: '6px 12px', borderRadius: '4px', fontSize: '1rem', width: '220px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: '#A78BFA' }}>插图 (Visual Input):</label>
                <div style={{ background: 'rgba(167, 139, 250, 0.2)', border: '1px solid #A78BFA', padding: '6px 16px', borderRadius: '4px', color: '#A78BFA', fontWeight: 'bold' }}>
                  🖼️ [28×28 Image Patch Region]
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.9rem', color: '#94A3B8' }}>后缀文本 (Suffix Text):</label>
                <input
                  type="text"
                  value={suffixText}
                  onChange={(e) => setSuffixText(e.target.value)}
                  style={{ background: '#0F172A', border: '1px solid #38BDF8', color: '#FFF', padding: '6px 12px', borderRadius: '4px', fontSize: '1rem', width: '220px' }}
                />
              </div>
            </div>
          </div>

          {/* Core Pipeline Visual Flow Diagram */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 860 360" width="100%" height="360" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-flow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38BDF8" />
                </marker>
                <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#A78BFA" />
                </marker>
              </defs>

              {/* Step 1: Text Branch */}
              <rect x="20" y="20" width="240" height="90" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
              <text x="140" y="48" fill="#38BDF8" fontSize="15" fontWeight="bold" textAnchor="middle">1. 文本 BPE 查表 (Lookup)</text>
              <text x="140" y="70" fill="#FFF" fontSize="13" textAnchor="middle">"{prefixText}" & "{suffixText}"</text>
              <text x="140" y="92" fill="#94A3B8" fontSize="12" fontFamily="monospace" textAnchor="middle">W_emb[ID] → x_text ∈ ℝ^(7,168)</text>

              {/* Step 2: Image Branch Part A - ViT */}
              <rect x="300" y="20" width="260" height="90" rx="8" fill="#0F172A" stroke="#A78BFA" strokeWidth="1.5" />
              <text x="430" y="48" fill="#A78BFA" fontSize="15" fontWeight="bold" textAnchor="middle">2. MoonViT-V2 编码 (Patch)</text>
              <text x="430" y="70" fill="#FFF" fontSize="13" textAnchor="middle">14×14×3 (588px) → Conv2d/ViT</text>
              <text x="430" y="92" fill="#A78BFA" fontSize="12" fontFamily="monospace" textAnchor="middle">4 个 Patch 向量 ∈ ℝ^(512)</text>

              {/* Step 3: Image Branch Part B - Pixel Shuffle */}
              <rect x="580" y="20" width="260" height="90" rx="8" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
              <text x="710" y="48" fill="#10B981" fontSize="15" fontWeight="bold" textAnchor="middle">3. 2×2 Pixel Shuffle (合并)</text>
              <text x="710" y="70" fill="#FFF" fontSize="13" textAnchor="middle">28×28 区域 4 个 Patch 拼接</text>
              <text x="710" y="92" fill="#10B981" fontSize="12" fontFamily="monospace" textAnchor="middle">512×4 → 1 个 Token ∈ ℝ^(2,048)</text>

              {/* Flow Arrows Top Row */}
              <line x1="560" y1="65" x2="580" y2="65" stroke="#A78BFA" strokeWidth="2" markerEnd="url(#arrow-purple)" />

              {/* Step 4: Projection Matrix W_proj */}
              <rect x="580" y="160" width="260" height="80" rx="8" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
              <text x="710" y="192" fill="#F59E0B" fontSize="15" fontWeight="bold" textAnchor="middle">4. 线性投影矩阵 W_proj</text>
              <text x="710" y="214" fill="#FFF" fontSize="13" textAnchor="middle">x_vis = W_proj · Vector_2048</text>
              <text x="710" y="230" fill="#F59E0B" fontSize="12" fontFamily="monospace" textAnchor="middle">投影对齐到 ℝ^(7,168)</text>

              <line x1="710" y1="110" x2="710" y2="160" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-flow)" />

              {/* Step 5: Sequence Concatenation */}
              <line x1="140" y1="110" x2="140" y2="280" stroke="#38BDF8" strokeWidth="2" />
              <line x1="140" y1="280" x2="180" y2="280" stroke="#38BDF8" strokeWidth="2" markerEnd="url(#arrow-flow)" />

              <line x1="710" y1="240" x2="710" y2="280" stroke="#F59E0B" strokeWidth="2" />
              <line x1="710" y1="280" x2="680" y2="280" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-flow)" />

              {/* Step 5 Box: Final Unified Sequence */}
              <rect x="180" y="250" width="500" height="60" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
              <text x="430" y="276" fill="#FFF" fontSize="15" fontWeight="bold" textAnchor="middle">5. 最终交错拼接序列 Stream X</text>
              <text x="430" y="296" fill="#10B981" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                X = [x_prefix, x_vision(28×28), x_suffix] ∈ ℝ^(T × 7,168) → 送入 Backbone
              </text>
            </svg>
          </div>

          {/* Quick Technical Takeaways Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <h4 style={{ color: '#38BDF8', margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 'bold' }}>🔤 文本 Token 转换机制</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                离散字符串经过 <b>BPE 分词器</b> 转换为整数 ID，随后直接在预训练词表矩阵 W_emb 中查找对应行，瞬间获得 7,168 维特征向量。
              </p>
            </div>

            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
              <h4 style={{ color: '#A78BFA', margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 'bold' }}>🖼️ 图像 Token 转换机制</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                图像为连续信号，无法直接查字典。通过 <b>MoonViT-V2 卷积/自注意力 + 2×2 Pixel Shuffle 拼接 + W_proj 矩阵乘法</b> 计算得出 7,168 维向量。
              </p>
            </div>

            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h4 style={{ color: '#10B981', margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 'bold' }}>🧠 统一的高维拓扑语义</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                两者形态上都是 7,168 维 `float32` 数组。虽然人类无法直观解释每个浮点数，但模型通过 93 层 Self-Attention 的高维内积计算，能在空间中精确对齐与交互。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 588d -> 512d PATCH ENCODER DETAILED SIMULATOR */}
      {activeTab === 'patchEncoder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#A78BFA', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🔬 14×14×3 (588d 像素) 如何转换为 512d 深度向量？
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              每个 $14 \times 14$ 像素的切片包含 $14 \times 14 \times 3 = 588$ 个 RGB 原始数值。在工程上，通常使用 <b>512 个不同的 $14 \times 14 \times 3$ 卷积核</b>（即 `Conv2d(3, 512, kernel_size=14, stride=14)`）覆盖整个切片进行一次性点乘运算。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
            {/* Left: 14x14 Patch RGB Visualizer */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>1. 原始 14×14 像素切片 (588d)</span>
              
              <div style={{ width: '220px', height: '220px', background: '#000', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: '1px', padding: '4px', border: '1px solid #334155' }}>
                {Array.from({ length: 196 }).map((_, idx) => {
                  const row = Math.floor(idx / 14);
                  const col = idx % 14;
                  const r = Math.floor(200 - row * 8);
                  const g = Math.floor(100 + col * 10);
                  const b = 220;
                  return (
                    <div
                      key={idx}
                      style={{ background: `rgb(${r},${g},${b})` }}
                      title={`Pixel (${row},${col}): RGB(${r},${g},${b})`}
                    />
                  );
                })}
              </div>

              <div style={{ fontSize: '0.95rem', color: '#94A3B8', textAlign: 'center' }}>
                像素点数: 196 × 3 通道 = <b>588 原始浮点数值</b>
              </div>
            </div>

            {/* Right: 512 Filter Selector & Output Inspection */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>2. 512 个不同权重的 14×14×3 卷积核提取器</span>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.95rem', color: '#94A3B8' }}>选择卷积核编号 (Filter #):</span>
                <input
                  type="range"
                  min="0"
                  max="511"
                  value={selectedFilterIdx}
                  onChange={(e) => setSelectedFilterIdx(parseInt(e.target.value))}
                  style={{ width: '200px' }}
                />
                <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '1rem', fontFamily: 'monospace' }}>
                  Filter #{selectedFilterIdx + 1} / 512
                </span>
              </div>

              {/* Active Filter Details */}
              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '6px', border: '1px solid rgba(167, 139, 250, 0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                  <span style={{ color: '#FFF', fontWeight: 'bold' }}>卷积核功能特性:</span>
                  <span style={{ color: '#38BDF8' }}>
                    {selectedFilterIdx % 4 === 0 && '🔍 垂直边缘检测器 (Vertical Edge Filter)'}
                    {selectedFilterIdx % 4 === 1 && '🎨 蓝绿色彩对比度检测器 (Color Contrast Filter)'}
                    {selectedFilterIdx % 4 === 2 && '纹理粗糙度特征器 (Texture Gradient Filter)'}
                    {selectedFilterIdx % 4 === 3 && '☀️ 高频明暗梯度提取器 (Brightness Gradient)'}
                  </span>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#94A3B8' }}>
                  每个卷积核带有 <b>14×14×3 = 588 个专属训练权重</b>。覆盖切片一次性乘加，输出 <b>1 个特征标量值</b>。
                </div>
                <div style={{ fontSize: '1.1rem', color: '#A78BFA', fontWeight: 'bold', marginTop: '4px', fontFamily: 'monospace' }}>
                  计算输出值 Output [{selectedFilterIdx}] = {(Math.sin(selectedFilterIdx * 0.4) * 0.85 + 0.12).toFixed(4)}
                </div>
              </div>

              {/* Resulting 512d Vector Bar */}
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '1rem', color: '#FFF', fontWeight: 'bold' }}>3. 拼合产生的 512 维 Patch 向量 (v_t ∈ ℝ^512)</span>
                <div style={{ display: 'flex', height: '24px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginTop: '8px' }}>
                  {Array.from({ length: 32 }).map((_, idx) => {
                    const isActive = Math.abs(idx * 16 - selectedFilterIdx) < 16;
                    const val = Math.sin(idx * 0.5);
                    const opacity = Math.abs(val);
                    return (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          background: isActive ? '#A78BFA' : `rgba(167, 139, 250, ${opacity * 0.6 + 0.1})`,
                          borderRight: '1px solid rgba(0,0,0,0.3)',
                          cursor: 'pointer'
                        }}
                        title={`Dimension [${idx * 16} ~ ${idx * 16 + 15}]`}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94A3B8', marginTop: '4px', fontFamily: 'monospace' }}>
                  <span>Index 0</span>
                  <span>Index 255</span>
                  <span>Index 511</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 2x2 PIXEL SHUFFLE SIMULATOR */}
      {activeTab === 'pixelShuffle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10B981', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🧩 2×2 Pixel Shuffle 空间重组（4 个 512d 合并为 1 个 2,048d）
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              直接把 512 维向量送入 LLM 序列太长（开销大）。通过 Pixel Shuffle，将<b>空间上相邻的 2×2（4个）$14 \times 14$ 小切片</b>按顺序首尾相接拼接在一起，代表一个 <b>$28 \times 28$ 像素的画面区域</b>。 Token 数量减少为 $1/4$，维度增加为 4 倍（$512 \times 4 = 2,048$ 维）。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px' }}>
            {/* Left: 2x2 Grid of 14x14 Patches (28x28 Region) */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>28×28 像素画面区域 (包含 4 个 Patch)</span>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#0B0F19', padding: '10px', borderRadius: '6px', border: '1px solid #10B981' }}>
                {samplePatches.map((patch, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPatchGroup(idx)}
                    style={{
                      background: patch.color + '22',
                      border: `2px solid ${patch.color}`,
                      borderRadius: '6px',
                      padding: '16px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      boxShadow: selectedPatchGroup === idx ? `0 0 12px ${patch.color}` : 'none'
                    }}
                  >
                    <span style={{ color: patch.color, fontWeight: 'bold', fontSize: '0.95rem' }}>Patch {idx + 1}</span>
                    <span style={{ color: '#FFF', fontSize: '0.85rem', marginTop: '4px' }}>14×14 px</span>
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontFamily: 'monospace', marginTop: '2px' }}>ℝ^512</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: '1.4' }}>
                💡 点击上图任意 Patch，可在右侧观察其在 2,048 维向量中所占有的 512 维数据区间。
              </div>
            </div>

            {/* Right: Merged 2,048d Vector Visualizer */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>合并后的单个 2,048 维 Token 向量结构</span>

              {/* 4 Segment Blocks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {samplePatches.map((patch, idx) => {
                  const isSelected = selectedPatchGroup === idx;
                  const startDim = idx * 512;
                  const endDim = (idx + 1) * 512 - 1;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedPatchGroup(idx)}
                      style={{
                        background: isSelected ? patch.color + '33' : '#0F172A',
                        border: `1.5px solid ${patch.color}`,
                        borderRadius: '6px',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        <span style={{ color: patch.color, fontWeight: 'bold', fontSize: '1rem' }}>
                          [{startDim} ~ {endDim}] ({patch.name})
                        </span>
                        <div style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '2px' }}>
                          包含 Patch {idx + 1} 的完整 512 维特征数值，零信息损耗
                        </div>
                      </div>
                      <span style={{ background: patch.color, color: '#000', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        512 维
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary Box */}
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', padding: '12px 16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '1rem' }}>
                  2×2 拼接结果 Token 向量:
                </span>
                <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                  512 + 512 + 512 + 512 = 2,048 维
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: UNIFIED 7,168d LATENT SPACE */}
      {activeTab === 'latentSpace' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#F59E0B', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              📐 7,168 维统一高维潜空间（Latent Geometry & Semantic Alignment）
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              文本与图像在乘以投影矩阵 W_proj 之后，均成为了 7,168 维 `float32` 数组。虽然人类无法直观解释每个数值的具体含义，但大模型通过 93 层 <b>Self-Attention 得分矩阵 (Q · Kᵀ / √d_h)</b> 计算几何相关度，精准实现跨模态理解！
            </p>
          </div>

          {/* Latent Space Interactive Inspection Canvas */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>
              高维向量余弦相似度与 Attention 点积对齐计算模拟
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
              {/* Pair 1: Text "cat" vs Image Patch (Cat Ear) */}
              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid #10B981', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1rem' }}>文本: "cat" (x_text)</span>
                  <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '1rem' }}>图像: 猫耳 Patch (x_vis)</span>
                </div>
                <div style={{ height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '92.4%', background: '#10B981', height: '100%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>7,168维 向量点积相似度:</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>0.924 (极高对齐)</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
                  💡 语言概念 "cat" 的 Query 向量与图像猫耳的 Key 向量在 7,168 维空间中几何夹角极小，模型直接关注此图像区域！
                </p>
              </div>

              {/* Pair 2: Text "cat" vs Image Patch (Sky Background) */}
              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid #64748B', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1rem' }}>文本: "cat" (x_text)</span>
                  <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '1rem' }}>图像: 蓝天背景 Patch</span>
                </div>
                <div style={{ height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '12.8%', background: '#64748B', height: '100%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>7,168维 向量点积相似度:</span>
                  <span style={{ color: '#64748B', fontWeight: 'bold', fontFamily: 'monospace' }}>0.128 (无关区域)</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
                  💡 背景区域向量点积权重大幅衰减，模型忽略非关键背景像素。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INVERSE DECODER RECONSTRUCTION */}
      {activeTab === 'decoder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#EC4899', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🔄 逆向重构还原验证（2,048d Token 还原回 28×28 原始像素画面）
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              验证单 Token 的信息完整性：在自编码器/生成模型中，1 个 2,048 维 Token 可以通过 <b>Un-shuffle 拆分为 4 个 512 维向量</b>，再通过 <b>转置卷积 `ConvTranspose2d` 还原为 4 个 588 维像素块</b>，最终精准重构出 28×28 像素的原图画面！
            </p>
          </div>

          {/* Interactive Reconstruction Inspection Panel */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>
                重构图像透明度对比 slider:
              </span>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.95rem' }}>原始像素</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={reconOpacity}
                  onChange={(e) => setReconOpacity(parseInt(e.target.value))}
                  style={{ width: '180px' }}
                />
                <span style={{ color: '#EC4899', fontWeight: 'bold', fontSize: '0.95rem', fontFamily: 'monospace' }}>
                  重构还原比: {reconOpacity}%
                </span>
              </div>
            </div>

            {/* Side by side comparison */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', alignItems: 'center', flexWrap: 'wrap', padding: '20px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '160px', height: '160px', background: '#000', borderRadius: '8px', border: '2px solid #38BDF8', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #10B981 0%, #38BDF8 50%, #A78BFA 100%)' }} />
                </div>
                <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '0.95rem' }}>1. 原始 28×28 像素画面</span>
                <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>2,352 原始 RGB 像素数值</span>
              </div>

              <div style={{ fontSize: '1.8rem', color: '#EC4899' }}>➔</div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#0F172A', border: '2px solid #EC4899', padding: '12px 18px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#EC4899', fontWeight: 'bold', fontSize: '1rem' }}>1 个 2,048 维 Token</div>
                  <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '4px' }}>Un-shuffle 拆分为 4 × 512d</div>
                </div>
                <span style={{ color: '#EC4899', fontWeight: 'bold', fontSize: '0.95rem' }}>2. 压缩特征潜表达</span>
              </div>

              <div style={{ fontSize: '1.8rem', color: '#EC4899' }}>➔</div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '160px', height: '160px', background: '#000', borderRadius: '8px', border: '2px solid #10B981', overflow: 'hidden', opacity: reconOpacity / 100 }}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #10B981 0%, #38BDF8 50%, #A78BFA 100%)' }} />
                </div>
                <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.95rem' }}>3. 还原解码画面 (MSE Loss &lt; 0.001)</span>
                <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>`ConvTranspose2d` 恢复 588px × 4</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
