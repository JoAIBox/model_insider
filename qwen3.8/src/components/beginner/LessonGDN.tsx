import React from 'react';
import type { BeginnerLesson } from './BeginnerAcademy';
import { BgnArrows, FlowLine, TokenChip } from './BeginnerAcademy';

/* ============ Lesson 3: GDN 线性注意力 (Qwen 3.8 独有) ============ */

/* ---------- Scene 1: 标准注意力的问题 ---------- */
const Scene1: React.FC = () => {
  const [seqLen, setSeqLen] = React.useState(3); // 0=1K, 1=8K, 2=32K, 3=128K, 4=512K, 5=1M
  const labels = ['1K', '8K', '32K', '128K', '512K', '1M'];
  const quadCost = [1, 64, 1024, 16384, 262144, 1000000]; // relative O(n²)
  const linearCost = [1, 8, 32, 128, 512, 1000]; // relative O(n)
  const maxBar = 600;

  const quadW = Math.min(maxBar, (quadCost[seqLen] / quadCost[5]) * maxBar);
  const linearW = Math.min(maxBar, (linearCost[seqLen] / quadCost[5]) * maxBar);
  const quadLabel = quadCost[seqLen] >= 1000 ? `${(quadCost[seqLen] / 1000).toFixed(0)}K` : `${quadCost[seqLen]}`;
  const linearLabel = linearCost[seqLen] >= 1000 ? `${(linearCost[seqLen] / 1000).toFixed(0)}K` : `${linearCost[seqLen]}`;

  return (
    <svg viewBox="0 0 760 310" width="100%" height="310">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">标准注意力的问题：越长越慢</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">拖动滑块改变序列长度，观察计算量的变化：</text>

      {/* 序列长度选择器 */}
      {labels.map((label, i) => (
        <g key={i} style={{ cursor: 'pointer' }} onClick={() => setSeqLen(i)}>
          <rect x={20 + i * 115} y={70} width={105} height={30} rx={6}
            fill={seqLen === i ? 'rgba(0,242,254,0.15)' : 'rgba(255,255,255,0.04)'}
            stroke={seqLen === i ? '#00F2FE' : 'rgba(255,255,255,0.1)'} strokeWidth={seqLen === i ? 2 : 1} />
          <text x={72 + i * 115} y={90} fill={seqLen === i ? '#00F2FE' : '#94A3B8'} fontSize="12" fontWeight={seqLen === i ? 'bold' : 'normal'} textAnchor="middle">
            {label} tokens
          </text>
        </g>
      ))}

      {/* 标准 Attention O(n²) */}
      <text x="20" y="134" fill="#EF4444" fontSize="12" fontWeight="bold">标准注意力 O(n²)</text>
      <text x="740" y="134" fill="#EF4444" fontSize="11" textAnchor="end" fontFamily="monospace">计算量: {quadLabel}×</text>
      <rect x="20" y="142" width={Math.max(4, quadW)} height="22" rx="4" fill="#EF4444" fillOpacity="0.7">
        <animate attributeName="width" from="4" to={Math.max(4, quadW)} dur="0.4s" fill="freeze" />
      </rect>

      {/* GDN O(1) */}
      <text x="20" y="192" fill="#10b981" fontSize="12" fontWeight="bold">GDN 线性注意力 O(1)</text>
      <text x="740" y="192" fill="#10b981" fontSize="11" textAnchor="end" fontFamily="monospace">计算量: {linearLabel}×</text>
      <rect x="20" y="200" width={Math.max(4, linearW)} height="22" rx="4" fill="#10b981" fillOpacity="0.7">
        <animate attributeName="width" from="4" to={Math.max(4, linearW)} dur="0.4s" fill="freeze" />
      </rect>

      {/* 差距说明 */}
      <text x="20" y="252" fill="#94A3B8" fontSize="12.5">
        {seqLen <= 2 ? (
          <tspan>短文本时差别不大——但长度一增加就天差地别。</tspan>
        ) : seqLen <= 4 ? (
          <tspan>
            <tspan fill="#EF4444" fontWeight="bold">{labels[seqLen]}</tspan> 时标准注意力的计算量已是 GDN 的
            <tspan fill="#fbbf24" fontWeight="bold"> {(quadCost[seqLen] / linearCost[seqLen]).toFixed(0)} 倍</tspan>！
          </tspan>
        ) : (
          <tspan>
            <tspan fill="#EF4444" fontWeight="bold">1M tokens</tspan> 时标准注意力需要
            <tspan fill="#EF4444" fontWeight="bold"> 10 亿次</tspan>运算，GDN 只需
            <tspan fill="#10b981" fontWeight="bold"> 100 万次</tspan>——差了
            <tspan fill="#fbbf24" fontWeight="bold"> 1000 倍</tspan>。
          </tspan>
        )}
      </text>
      <text x="20" y="278" fill="#94A3B8" fontSize="12.5">
        这就是 Qwen 3.8 在 75% 的层中使用 GDN 的原因——长文本部署成本大幅降低。
      </text>
      <text x="20" y="300" fill="#64748B" fontSize="11">
        GDN = Gated DeltaNet，一种恒定内存的线性注意力，替代标准 Softmax 注意力。
      </text>
    </svg>
  );
};

/* ---------- Scene 2: GDN 核心思想——压缩笔记本 ---------- */
const Scene2: React.FC = () => {
  const [step, setStep] = React.useState(0);
  const tokenStream = ['Qwen', '3.8', '是', '一个', '混合', '注意力', '模型'];

  return (
    <svg viewBox="0 0 760 320" width="100%" height="320">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">GDN 核心思想：压缩笔记本</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">
        标准注意力像翻全书；GDN 像一本不断更新的<tspan fill="#67e8f9" fontWeight="bold">压缩笔记本</tspan>。
      </text>

      {/* Token 流 */}
      <text x="20" y="82" fill="#67e8f9" fontSize="10" fontWeight="bold" fontFamily="monospace">输入 Token 流：</text>
      {tokenStream.map((tk, i) => (
        <g key={i} style={{ cursor: 'pointer' }} onClick={() => setStep(Math.min(i, 4))}>
          <TokenChip text={tk} x={20 + i * 96} y={90} w={86} h={34}
            color={i <= step ? '#67e8f9' : '#64748B'}
            dim={i > step + 1} />
          {i === step && (
            <rect x={20 + i * 96} y={90} width={86} height={34} rx={6}
              fill="none" stroke="#67e8f9" strokeWidth="2.5" className="bgn-ripple" />
          )}
        </g>
      ))}

      {/* 记忆矩阵 S_t */}
      <g transform="translate(60,155)">
        <text x="0" y="-8" fill="#c4b5fd" fontSize="12" fontWeight="bold">记忆状态 S_t (恒定大小)</text>
        {Array.from({ length: 4 }, (_, r) =>
          Array.from({ length: 4 }, (_, c) => {
            const intensity = Math.sin((r + c + step) * 0.8) * 0.4 + 0.5;
            return (
              <rect key={`${r}${c}`}
                x={c * 38} y={r * 38}
                width={34} height={34} rx={4}
                fill={`rgba(196,181,253,${(intensity * 0.6).toFixed(2)})`}
                stroke="rgba(196,181,253,0.4)"
                strokeWidth="1">
                <animate attributeName="fill-opacity" values={`${intensity * 0.3};${intensity * 0.8};${intensity * 0.3}`} dur="2s" repeatCount="indefinite" />
              </rect>
            );
          })
        )}
        <text x="75" y="174" fill="#94A3B8" fontSize="10" textAnchor="middle">
          固定 d × d 矩阵
        </text>
        <text x="75" y="190" fill="#c4b5fd" fontSize="10" textAnchor="middle">
          内存恒定 O(1)
        </text>
      </g>

      {/* 箭头 & 说明 */}
      <g transform="translate(250,155)">
        <text x="0" y="10" fill="#E2E8F0" fontSize="14" fontWeight="bold">每次来新 Token：</text>
        <text x="0" y="38" fill="#fbbf24" fontSize="12">1. 衰减（Decay）</text>
        <text x="16" y="56" fill="#94A3B8" fontSize="11">旧信息乘以遗忘率 α → 保留重要的</text>
        <text x="0" y="82" fill="#10b981" fontSize="12">2. 增量写入（Delta Write）</text>
        <text x="16" y="100" fill="#94A3B8" fontSize="11">只写「新信息和旧笔记的差异」</text>
        <text x="0" y="126" fill="#67e8f9" fontSize="12">3. 读取（Read）</text>
        <text x="16" y="144" fill="#94A3B8" fontSize="11">用当前查询 q 检索笔记本 → 输出</text>

        <rect x="0" y="164" width="480" height="28" rx="6"
          fill="rgba(103,232,249,0.08)" stroke="rgba(103,232,249,0.2)" />
        <text x="240" y="182" fill="#67e8f9" fontSize="11" fontWeight="bold" textAnchor="middle">
          S_t = α · S_(t-1) + (v_t - S·k_t) · k_t^T  ← Delta Rule
        </text>
      </g>

      <text x="20" y="300" fill="#94A3B8" fontSize="12.5">
        ↑ 点击 Token 流中的词，观察记忆矩阵的变化。不管处理多少个 Token，S 的大小<tspan fill="#10b981" fontWeight="bold">永远不变</tspan>。
      </text>
    </svg>
  );
};

/* ---------- Scene 3: 衰减门控 ---------- */
const Scene3: React.FC = () => {
  const [alpha, setAlpha] = React.useState(85);
  const oldValues = [0.9, 0.7, 0.5, 0.3, 0.8, 0.6, 0.4, 0.2];

  return (
    <svg viewBox="0 0 760 280" width="100%" height="280">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">衰减门控（Decay）—— 清理桌面</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">拖动滑块调整衰减率 α，观察旧记忆被清理的程度：</text>

      {/* Alpha 滑块 */}
      <g>
        <text x="20" y="86" fill="#fbbf24" fontSize="12" fontWeight="bold">衰减率 α = {(alpha / 100).toFixed(2)}</text>
        <text x="740" y="86" fill="#64748B" fontSize="11" textAnchor="end">
          α 越高 → 保留越多旧记忆 · α 越低 → 清理越多
        </text>
        {/* 滑块轨道 */}
        <rect x="20" y="96" width="720" height="8" rx="4" fill="rgba(255,255,255,0.08)" />
        <rect x="20" y="96" width={720 * alpha / 100} height="8" rx="4" fill="#fbbf24" fillOpacity="0.6" />
        {/* 滑块按钮 */}
        {[20, 40, 60, 80, 95].map((v, i) => (
          <g key={i} style={{ cursor: 'pointer' }} onClick={() => setAlpha(v)}>
            <circle cx={20 + 720 * v / 100} cy={100} r={alpha === v ? 10 : 7}
              fill={alpha === v ? '#fbbf24' : 'rgba(255,255,255,0.15)'}
              stroke={alpha === v ? '#fbbf24' : 'rgba(255,255,255,0.2)'} strokeWidth="2" />
            <text x={20 + 720 * v / 100} y={122} fill="#94A3B8" fontSize="9" textAnchor="middle">{v}%</text>
          </g>
        ))}
      </g>

      {/* 旧记忆 → 衰减后 */}
      <text x="20" y="152" fill="#c4b5fd" fontSize="11" fontWeight="bold">旧记忆 S_(t-1)：</text>
      {oldValues.map((v, i) => (
        <rect key={`old${i}`} x={20 + i * 88} y={160} width={80} height={28} rx={4}
          fill={`rgba(196,181,253,${v * 0.8})`}
          stroke="rgba(196,181,253,0.4)" />
      ))}

      <text x="380" y="210" fill="#fbbf24" fontSize="14" fontWeight="bold" textAnchor="middle">× α = {(alpha / 100).toFixed(2)}</text>

      <text x="20" y="234" fill="#10b981" fontSize="11" fontWeight="bold">衰减后 α·S_(t-1)：</text>
      {oldValues.map((v, i) => {
        const newV = v * alpha / 100;
        return (
          <rect key={`new${i}`} x={20 + i * 88} y={242} width={80} height={28} rx={4}
            fill={`rgba(16,185,129,${newV * 0.8})`}
            stroke="rgba(16,185,129,0.4)">
            <animate attributeName="fill-opacity" from="0" to="1" dur="0.4s" fill="freeze" />
          </rect>
        );
      })}

      <text x="380" y="290" fill="#94A3B8" fontSize="12" textAnchor="middle">
        {alpha > 80 ? '高 α：大部分旧记忆被保留。适合长期依赖的场景。' :
         alpha > 50 ? '中等 α：平衡新旧信息。清理了部分旧记忆为新内容腾空间。' :
         '低 α：大量清理旧记忆。适合快速遗忘的场景。'}
      </text>
    </svg>
  );
};

/* ---------- Scene 4: Delta 写入 ---------- */
const Scene4: React.FC = () => {
  const [showDelta, setShowDelta] = React.useState(false);

  return (
    <svg viewBox="0 0 760 290" width="100%" height="290">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">Delta 写入 —— 只记不同点</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">
        不把整个信息塞进记忆，而是问「这和我已知的有什么不同？」只写<tspan fill="#10b981" fontWeight="bold">差异</tspan>。
      </text>

      {/* 新 Token */}
      <g>
        <TokenChip text="注意力" x={30} y={80} w={80} h={34} color="#67e8f9" />
        <text x="70" y="130" fill="#67e8f9" fontSize="10" textAnchor="middle">新 Token v_t</text>
      </g>

      <FlowLine x1={120} y1={97} x2={180} y2={97} color="#67e8f9" />

      {/* 记忆预测 */}
      <g>
        <rect x="185" y="74" width="140" height="46" rx="8" fill="#0A0F1D" stroke="rgba(196,181,253,0.3)" />
        <text x="255" y="94" fill="#c4b5fd" fontSize="12" fontWeight="bold" textAnchor="middle">记忆预测 S·k_t</text>
        <text x="255" y="112" fill="#94A3B8" fontSize="10" textAnchor="middle">「我觉得它应该是...」</text>
      </g>

      <FlowLine x1={335} y1={97} x2={390} y2={97} color="#fbbf24" />

      {/* 差异 δ */}
      <g style={{ cursor: 'pointer' }} onClick={() => setShowDelta(!showDelta)}>
        <rect x="395" y="74" width="140" height="46" rx="8"
          fill={showDelta ? 'rgba(16,185,129,0.15)' : 'rgba(251,191,36,0.1)'}
          stroke={showDelta ? '#10b981' : '#fbbf24'} strokeWidth="1.5" />
        <text x="465" y="94" fill={showDelta ? '#10b981' : '#fbbf24'} fontSize="12" fontWeight="bold" textAnchor="middle">
          {showDelta ? 'δ_t = v_t − S·k_t' : '点击计算差异 δ'}
        </text>
        <text x="465" y="112" fill="#94A3B8" fontSize="10" textAnchor="middle">
          {showDelta ? '「原来这部分是新的！」' : '只写增量，效率极高'}
        </text>
      </g>

      {showDelta && (
        <g>
          <FlowLine x1={540} y1={97} x2={600} y2={97} color="#10b981" />
          <rect x="605" y="74" width="130" height="46" rx="8"
            fill="rgba(196,181,253,0.12)" stroke="rgba(196,181,253,0.4)">
            <animate attributeName="fill-opacity" from="0" to="1" dur="0.3s" fill="freeze" />
          </rect>
          <text x="670" y="94" fill="#c4b5fd" fontSize="12" fontWeight="bold" textAnchor="middle">写入 S_t</text>
          <text x="670" y="112" fill="#94A3B8" fontSize="10" textAnchor="middle">S + δ·k^T</text>
        </g>
      )}

      {/* 对比说明 */}
      <g transform="translate(20,150)">
        <rect x="0" y="0" width="350" height="50" rx="8" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.2)" />
        <text x="10" y="20" fill="#EF4444" fontSize="11" fontWeight="bold">❌ 标准线性注意力</text>
        <text x="10" y="38" fill="#94A3B8" fontSize="10">S = S + v · k^T → 盲目叠加，旧信息被噪声淹没</text>

        <rect x="370" y="0" width="370" height="50" rx="8" fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.2)" />
        <text x="380" y="20" fill="#10b981" fontSize="11" fontWeight="bold">✅ Delta Rule (GDN)</text>
        <text x="380" y="38" fill="#94A3B8" fontSize="10">S = α·S + (v - S·k) · k^T → 只写差异 + 门控遗忘</text>
      </g>

      <text x="20" y="234" fill="#94A3B8" fontSize="12.5">
        这就是 <tspan fill="#67e8f9" fontWeight="bold">Delta Rule</tspan> 的核心：
        记忆只存储「当前观测与预测的差异」，避免盲目覆盖。
      </text>
      <text x="20" y="258" fill="#94A3B8" fontSize="12.5">
        同时配合衰减门控 α 灵活遗忘，在保留重要长期记忆的同时清除无用信息。
      </text>
      <text x="20" y="280" fill="#64748B" fontSize="11">↑ 点击黄色方块触发差异计算</text>
    </svg>
  );
};

/* ---------- Scene 5: 读取 ---------- */
const Scene5: React.FC = () => {
  const [querying, setQuerying] = React.useState(false);

  return (
    <svg viewBox="0 0 760 250" width="100%" height="250">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">读取 —— 带着问题查笔记本</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">遇到新词时，用查询向量 q 在记忆矩阵 S 中搜索相关内容。</text>

      {/* 查询 q */}
      <g style={{ cursor: 'pointer' }} onClick={() => setQuerying(!querying)}>
        <TokenChip text="q_t" x={30} y={80} w={70} h={34} color="#67e8f9" />
        <text x="65" y="130" fill="#67e8f9" fontSize="10" textAnchor="middle">
          {querying ? '正在查询...' : '点击发起查询'}
        </text>
      </g>

      {querying && <FlowLine x1={110} y1={97} x2={180} y2={97} color="#67e8f9" />}

      {/* 记忆矩阵 */}
      <g transform="translate(190,72)">
        <rect x="0" y="0" width="160" height="56" rx="10"
          fill={querying ? 'rgba(103,232,249,0.12)' : 'rgba(196,181,253,0.08)'}
          stroke={querying ? '#67e8f9' : 'rgba(196,181,253,0.3)'}
          strokeWidth={querying ? 2 : 1}>
          {querying && <animate attributeName="stroke-opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />}
        </rect>
        <text x="80" y="24" fill="#c4b5fd" fontSize="13" fontWeight="bold" textAnchor="middle">记忆 S_t</text>
        <text x="80" y="44" fill="#94A3B8" fontSize="10" textAnchor="middle">d × d 恒定矩阵</text>
      </g>

      {querying && <FlowLine x1={360} y1={100} x2={430} y2={100} color="#A78BFA" />}

      {/* 输出 */}
      <g opacity={querying ? 1 : 0.2}>
        <rect x="440" y="76" width="140" height="48" rx="8"
          fill={querying ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.03)'}
          stroke={querying ? '#A78BFA' : 'rgba(255,255,255,0.08)'}>
          {querying && <animate attributeName="fill-opacity" from="0" to="1" dur="0.4s" fill="freeze" />}
        </rect>
        <text x="510" y="98" fill="#A78BFA" fontSize="13" fontWeight="bold" textAnchor="middle">y_t = S_t · q_t</text>
        <text x="510" y="116" fill="#94A3B8" fontSize="10" textAnchor="middle">输出向量</text>
      </g>

      {querying && (
        <g>
          <FlowLine x1={590} y1={100} x2={660} y2={100} color="#10b981" />
          <TokenChip text="输出" x={670} y={82} w={70} h={34} color="#10b981" />
        </g>
      )}

      <text x="20" y="170" fill="#94A3B8" fontSize="12.5">
        <tspan fill="#67e8f9" fontWeight="bold">y_t = S_t · q_t</tspan>：用查询向量检索记忆 → 得到当前位置的预测输出。
      </text>
      <text x="20" y="196" fill="#94A3B8" fontSize="12.5">
        整个过程只需<tspan fill="#10b981" fontWeight="bold">一次矩阵乘法</tspan>，无论历史有多长，计算量恒定。
      </text>
      <text x="20" y="222" fill="#94A3B8" fontSize="12.5">
        这就是 GDN 能做到 O(1) 推理的秘密——它不需要像标准注意力那样回顾所有历史 Token。
      </text>
    </svg>
  );
};

/* ---------- Scene 6: 3:1 混合架构 ---------- */
const Scene6: React.FC = () => {
  const [hoveredLayer, setHoveredLayer] = React.useState(-1);
  const cycle = [
    { type: 'GDN', color: '#67e8f9', desc: '快速局部处理，O(1) 恒定内存' },
    { type: 'GDN', color: '#67e8f9', desc: '继续压缩历史，更新记忆状态' },
    { type: 'GDN', color: '#67e8f9', desc: '三层 GDN 积累足够的局部特征' },
    { type: 'Attn', color: '#c4b5fd', desc: '全局锚点：精确检索全部历史' },
  ];

  return (
    <svg viewBox="0 0 760 300" width="100%" height="300">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">3:1 混合架构 —— GDN + 注意力</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">
        3 层 GDN 负责快速处理，1 层全局注意力做精确检索。鼠标悬停查看每层角色：
      </text>

      {/* 16 Cycle × 4 层 */}
      <text x="20" y="84" fill="#64748B" fontSize="10" fontFamily="monospace">
        64 层 = 16 个周期 × 4 层/周期（3 GDN + 1 Gated Attention）
      </text>

      {/* 周期示意 */}
      <g transform="translate(20,94)">
        {Array.from({ length: 16 }, (_, cycleIdx) => {
          const cx = (cycleIdx % 8) * 90;
          const cy = Math.floor(cycleIdx / 8) * 68;
          return (
            <g key={cycleIdx}>
              {cycle.map((layer, li) => {
                const lx = cx + li * 20;
                const isHovered = hoveredLayer === cycleIdx * 4 + li;
                return (
                  <g key={li}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredLayer(cycleIdx * 4 + li)}
                    onMouseLeave={() => setHoveredLayer(-1)}
                  >
                    <rect x={lx} y={cy} width={17} height={42} rx={3}
                      fill={isHovered ? `${layer.color}40` : `${layer.color}18`}
                      stroke={layer.color}
                      strokeWidth={isHovered ? 2.5 : 1}
                      strokeOpacity={isHovered ? 1 : 0.5} />
                    {isHovered && (
                      <circle cx={lx + 8.5} cy={cy - 4} r="3" fill={layer.color} className="bgn-pulse" />
                    )}
                  </g>
                );
              })}
              <text x={cx + 35} y={cy + 54} fill="#64748B" fontSize="8" textAnchor="middle">C{cycleIdx + 1}</text>
            </g>
          );
        })}
      </g>

      {/* 悬停详情 */}
      {hoveredLayer >= 0 && (
        <g>
          <rect x="20" y="236" width="720" height="36" rx="6"
            fill={`${cycle[hoveredLayer % 4].color}12`}
            stroke={cycle[hoveredLayer % 4].color} strokeWidth="1.2" />
          <text x="35" y="256" fill={cycle[hoveredLayer % 4].color} fontSize="12" fontWeight="bold">
            Layer {hoveredLayer + 1} ({cycle[hoveredLayer % 4].type}) — Cycle {Math.floor(hoveredLayer / 4) + 1}
          </text>
          <text x="400" y="256" fill="#94A3B8" fontSize="11">
            {cycle[hoveredLayer % 4].desc}
          </text>
        </g>
      )}
      {hoveredLayer < 0 && (
        <g>
          <rect x="20" y="236" width="720" height="36" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />
          <text x="380" y="258" fill="#64748B" fontSize="11" textAnchor="middle">
            ↑ 悬停在方块上查看每层的角色 · 青色 = GDN · 紫色 = Gated Attention
          </text>
        </g>
      )}

      <text x="20" y="292" fill="#94A3B8" fontSize="12.5">
        短期靠<tspan fill="#67e8f9" fontWeight="bold">笔记本（GDN）</tspan>快速处理，
        关键时刻翻<tspan fill="#c4b5fd" fontWeight="bold">全书（注意力）</tspan>精确检索——混合才是最强。
      </text>
    </svg>
  );
};

export const LessonGDN: BeginnerLesson = {
  id: 'gdn',
  label: 'GDN 线性注意力',
  emoji: '⚡',
  title: '第 3 课 · GDN 线性注意力',
  subtitle: 'Qwen 3.8 的核心创新——用恒定内存替代标准注意力。',
  scenes: [
    {
      title: '标准注意力的问题：越长越慢',
      analogy: '读一本百万字的书，每读一段都要重新翻前面所有页——这就是标准注意力。',
      explain: <>标准注意力的计算量随序列长度<b>平方级增长</b> O(n²)，而 GDN 只需<b>恒定</b>的 O(1) 内存。</>,
      visual: <Scene1 />,
      keypoint: '标准注意力 O(n²) 在长文本时爆炸。GDN 始终 O(1)——这就是 Qwen 用它的原因。',
    },
    {
      title: 'GDN 核心思想：压缩笔记本',
      analogy: '不翻全书，而是维护一本压缩笔记本——新信息来了就更新笔记，旧的适当遗忘。',
      explain: <>GDN 用一个<b>固定大小的记忆矩阵 S_t</b>（d×d）来压缩所有历史信息。每个新 Token 更新这个矩阵，但矩阵大小不变。</>,
      visual: <Scene2 />,
      keypoint: '记忆矩阵 S_t 大小恒定——不管处理 1K 还是 1M 个 Token，内存都一样。',
    },
    {
      title: '衰减门控：清理桌面',
      analogy: '每次处理新词时，决定保留多少旧记忆。像定期清理桌面，保留重要文件，丢掉过时的。',
      explain: <>衰减率 α 控制旧记忆的保留比例。α 越高保留越多，α 越低清理越多。这让模型能<b>灵活平衡</b>长期记忆和短期信息。</>,
      visual: <Scene3 />,
      keypoint: '衰减门控让模型自主决定保留多少历史信息——灵活擦除无用记忆。',
    },
    {
      title: 'Delta 写入：只记不同点',
      analogy: '与其把整个句子塞进脑子，不如想想"这和我知道的有什么不同？"只记这个增量。',
      explain: <>标准线性注意力盲目叠加新信息，导致噪声积累。GDN 的 <b>Delta Rule</b> 只写入「当前观测 v_t 与记忆预测 S·k_t 的差异」δ_t，避免冗余写入。</>,
      visual: <Scene4 />,
      keypoint: 'Delta Rule = 只存储增量信息。高效、精准、不浪费。',
    },
    {
      title: '读取：带着问题查笔记本',
      analogy: '遇到新词（如"注意力"）时，快速在压缩笔记本中搜索相关内容，得到当前预测输出。',
      explain: <>读取只需一次矩阵乘法 <b>y_t = S_t · q_t</b>。无论历史有多长，计算量恒定。这就是 GDN 做到 O(1) 推理的秘密。</>,
      visual: <Scene5 />,
      keypoint: 'y_t = S_t · q_t：一次矩阵乘法就能检索全部历史。',
    },
    {
      title: '3:1 混合架构',
      analogy: '短期靠笔记本（GDN）快速处理，关键时刻翻全书（注意力）精确检索。',
      explain: <>Qwen 3.8 的 64 层骨干由 <b>16 个周期</b>组成，每个周期 = 3 层 GDN + 1 层 Gated Attention。75% 的层无需 KV Cache，显存节约 70%+。</>,
      visual: <Scene6 />,
      keypoint: '3:1 混合 = GDN 高效压缩 + 注意力精确检索。两者互补，性能最优。',
    },
  ],
};
