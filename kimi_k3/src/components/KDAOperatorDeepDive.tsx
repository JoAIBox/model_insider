import React, { useState } from 'react';

export const KDAOperatorDeepDive: React.FC = () => {
  const [decayBeta, setDecayBeta] = useState<number>(0.15); // Dynamic decay gate \beta_t
  const [activeTab, setActiveTab] = useState<'recurrence' | 'matrixDimensions' | 'parallelVsRecurrent'>('recurrence');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              KDA (Kimi Delta Attention) 稠密注意力子模块原理与矩阵推导
            </h2>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid #38BDF8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Dense Gated Delta Recurrence Attention (69 Layers)
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            解密 Kimi K3 93 层 Backbone 中占比最高的 69 层 KDA 稠密注意力子模块：结合线性循环状态矩阵 $S_t$ 与动态 Key/Value 门控衰减
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('recurrence')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'recurrence' ? '#38BDF8' : 'transparent',
              color: activeTab === 'recurrence' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            1. S_t 循环状态矩阵演进
          </button>
          <button
            onClick={() => setActiveTab('matrixDimensions')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'matrixDimensions' ? '#A78BFA' : 'transparent',
              color: activeTab === 'matrixDimensions' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            2. 矩阵维度与映射推导
          </button>
          <button
            onClick={() => setActiveTab('parallelVsRecurrent')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'parallelVsRecurrent' ? '#10B981' : 'transparent',
              color: activeTab === 'parallelVsRecurrent' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            3. O(1) 推理 vs O(T) 并行训练
          </button>
        </div>
      </div>

      {/* TAB 1: RECURRENCE MATH & DECAY GATE SIMULATOR */}
      {activeTab === 'recurrence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Formula Card */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#38BDF8', margin: 0, fontWeight: 'bold' }}>
              📐 KDA 状态更新与输出计算核心公式
            </h3>
            
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '1.1rem', color: '#FFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>// 1. 动态衰减门控与 Delta 状态更新</div>
              <div style={{ color: '#38BDF8' }}>S_t = Diag(1 - β_t) · S_(t-1) + K_tᵀ · V_t</div>
              <div>// 2. Query 检索与输出门控掩码</div>
              <div style={{ color: '#10B981' }}>O_t = σ(W_g · x_t) ⊙ ( Q_t · S_t · W_o )</div>
            </div>

            {/* Interactive Beta Gate Slider */}
            <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                <span style={{ color: '#FFF', fontWeight: 'bold' }}>调节动态 Key/Value 遗忘门控概率 β_t:</span>
                <span style={{ color: '#38BDF8', fontWeight: 'bold', fontFamily: 'monospace' }}>β_t = {decayBeta.toFixed(2)} (保留率: {((1 - decayBeta) * 100).toFixed(1)}%)</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.8"
                step="0.05"
                value={decayBeta}
                onChange={(e) => setDecayBeta(parseFloat(e.target.value))}
              />
              <p style={{ fontSize: '0.92rem', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
                💡 <b>遗忘门控机制 (Decay Gate):</b> 当 β_t 增大时，历史注意力记忆矩阵 S_t-1 以更高的比例被擦除（类似于 LSTM 的遗忘门），使模型能快速刷新注意力重点，处理长上下文时不发生梯度爆炸。
              </p>
            </div>
          </div>

          {/* SVG Diagram for Recurrent Memory State S_t */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 820 260" width="100%" height="260" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-kda" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38BDF8" />
                </marker>
              </defs>

              {/* Previous Memory State S_t-1 */}
              <rect x="20" y="80" width="160" height="90" rx="8" fill="#0F172A" stroke="#94A3B8" strokeWidth="1.5" />
              <text x="100" y="115" fill="#FFF" fontSize="15" fontWeight="bold" textAnchor="middle">历史记忆 S_t-1</text>
              <text x="100" y="138" fill="#94A3B8" fontSize="13" fontFamily="monospace" textAnchor="middle">ℝ^(d_h × d_h)</text>

              <line x1="180" y1="125" x2="240" y2="125" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arrow-kda)" />

              {/* Decay Gate Operation */}
              <rect x="240" y="80" width="160" height="90" rx="8" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="2" />
              <text x="320" y="115" fill="#38BDF8" fontSize="15" fontWeight="bold" textAnchor="middle">门控衰减 (1-β_t)</text>
              <text x="320" y="138" fill="#FFF" fontSize="13" fontFamily="monospace" textAnchor="middle">保留率 {((1 - decayBeta) * 100).toFixed(0)}%</text>

              <line x1="400" y1="125" x2="460" y2="125" stroke="#38BDF8" strokeWidth="2" markerEnd="url(#arrow-kda)" />

              {/* Addition with K_t^T * V_t */}
              <rect x="460" y="80" width="160" height="90" rx="8" fill="rgba(167, 139, 250, 0.15)" stroke="#A78BFA" strokeWidth="2" />
              <text x="540" y="115" fill="#A78BFA" fontSize="15" fontWeight="bold" textAnchor="middle">+ K_t^T · V_t</text>
              <text x="540" y="138" fill="#FFF" fontSize="13" fontFamily="monospace" textAnchor="middle">新增外积更新量</text>

              <line x1="620" y1="125" x2="680" y2="125" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-kda)" />

              {/* New Memory State S_t */}
              <rect x="680" y="80" width="130" height="90" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
              <text x="745" y="115" fill="#FFF" fontSize="15" fontWeight="bold" textAnchor="middle">最新 S_t</text>
              <text x="745" y="138" fill="#10B981" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">ℝ^(128×128)</text>
            </svg>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIX DIMENSIONS & OPERATOR MAPPINGS */}
      {activeTab === 'matrixDimensions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#A78BFA', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              📊 KDA 算子物理变量与矩阵维度拆解表
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              在 96 个 Head 的并行架构下，每个注意力头的记忆矩阵 $S_t$ 尺寸固定为 $128 \times 128$。
            </p>
          </div>

          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 180px', gap: '10px', fontSize: '1.05rem' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontWeight: 'bold', paddingBottom: '6px' }}>符号变量</div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontWeight: 'bold', paddingBottom: '6px' }}>物理含义</div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontWeight: 'bold', paddingBottom: '6px' }}>矩阵维度</div>

              <div style={{ color: '#38BDF8', fontWeight: 'bold' }}>x_t</div><div>当前 Token 隐藏状态输入</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
              <div style={{ color: '#38BDF8', fontWeight: 'bold' }}>Q_t, K_t, V_t</div><div>经过 W_q, W_k, W_v 投影后的 Query/Key/Value</div><div style={{ fontFamily: 'monospace' }}>[Heads=96, d_h=128]</div>
              <div style={{ color: '#A78BFA', fontWeight: 'bold' }}>S_t</div><div>单个 Head 的隐式记忆状态矩阵 (Recurrent Memory)</div><div style={{ fontFamily: 'monospace' }}>[128 × 128]</div>
              <div style={{ color: '#10B981', fontWeight: 'bold' }}>β_t</div><div>Sigmoid 激活产生的动态遗忘门控标量/向量</div><div style={{ fontFamily: 'monospace' }}>[Heads=96, d_h=128]</div>
              <div style={{ color: '#F59E0B', fontWeight: 'bold' }}>W_o</div><div>多头合并后的输出线性投影矩阵</div><div style={{ fontFamily: 'monospace' }}>[7,168 × 7,168]</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PARALLEL TRAINING VS RECURRENT INFERENCE */}
      {activeTab === 'parallelVsRecurrent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10B981', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              ⚡ O(1) 常数级推理显存 vs O(T) 训练级并行 Scan 算法
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              KDA 同时具备了 **RNN 的 O(1) 推理优势** 与 **Transformer 的 O(T) 并行训练优势**！
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid #38BDF8', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1.1rem' }}>🚀 自回归生成模式 (O(1) Memory Inference)</span>
              <p style={{ color: '#94A3B8', fontSize: '0.98rem', lineHeight: '1.6', margin: 0 }}>
                在单 Token 逐字生成阶段，模型**不需要保存庞大的 KV Cache**。只需要随身携带一个固定 $128 \times 128$ 大小的矩阵 $S_t$，即可完成上下文记忆的更新与检索，显存占用恒定为常数 O(1)！
              </p>
            </div>

            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid #A78BFA', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '1.1rem' }}>⚡ 前馈训练模式 (O(T) Parallel Associative Scan)</span>
              <p style={{ color: '#94A3B8', fontSize: '0.98rem', lineHeight: '1.6', margin: 0 }}>
                在 GPU 批量预训练阶段，利用结合律（Associative Property），可以通过 Parallel Prefix Scan 算法在 $O(\log T)$ 的并行深度内一次性计算出全序列 $T$ 个时刻的 $S_1, S_2, \dots, S_T$，充分吃满 GPU 矩阵并行算力！
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
