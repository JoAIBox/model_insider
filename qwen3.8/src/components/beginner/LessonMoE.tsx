import React from 'react';
import type { BeginnerLesson } from './BeginnerAcademy';
import { BgnArrows, FlowLine, TokenChip } from './BeginnerAcademy';

/* ============ Lesson 4: MoE 专家路由 (Qwen 3.8 适配) ============ */

/* ---------- Scene 1: Dense vs MoE ---------- */
const Scene1: React.FC = () => {
  const [modelType, setModelType] = React.useState<'dense' | 'moe'>('moe');

  return (
    <svg viewBox="0 0 760 290" width="100%" height="290">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">Dense vs MoE：全科医生 vs 专家大医院</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">点击切换模式，对比两种模型的处理方式：</text>

      {/* 模式选择 */}
      <g style={{ cursor: 'pointer' }} onClick={() => setModelType(modelType === 'dense' ? 'moe' : 'dense')}>
        <rect x="20" y="72" width="160" height="32" rx={6}
          fill={modelType === 'dense' ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)'}
          stroke={modelType === 'dense' ? '#38BDF8' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5" />
        <text x="100" y="92" fill={modelType === 'dense' ? '#38BDF8' : '#94A3B8'} fontSize="12" fontWeight="bold" textAnchor="middle">
          Dense (27B 单一网络)
        </text>
      </g>
      <g style={{ cursor: 'pointer' }} onClick={() => setModelType(modelType === 'moe' ? 'dense' : 'moe')}>
        <rect x="195" y="72" width="180" height="32" rx={6}
          fill={modelType === 'moe' ? 'rgba(196,181,253,0.15)' : 'rgba(255,255,255,0.04)'}
          stroke={modelType === 'moe' ? '#c4b5fd' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5" />
        <text x="285" y="92" fill={modelType === 'moe' ? '#c4b5fd' : '#94A3B8'} fontSize="12" fontWeight="bold" textAnchor="middle">
          MoE (2.4T 512 专家网格)
        </text>
      </g>

      {/* 示意图 */}
      <g transform="translate(20,120)">
        <TokenChip text="Token" x={0} y={40} w={70} color="#67e8f9" />
        <FlowLine x1={80} y1={57} x2={150} y2={57} color="#67e8f9" />

        {modelType === 'dense' ? (
          /* Dense 模式 */
          <g>
            <rect x="160" y="10" width="300" height="95" rx={10} fill="rgba(56,189,248,0.1)" stroke="#38BDF8" strokeWidth="1.5" />
            <text x="310" y="45" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">单一庞大 FFN 网络</text>
            <text x="310" y="70" fill="#94A3B8" fontSize="11" textAnchor="middle">27B 参数全部参与每个 Token 计算</text>
          </g>
        ) : (
          /* MoE 模式 */
          <g>
            {/* Router */}
            <rect x="160" y="30" width="90" height="54" rx={8} fill="rgba(251,191,36,0.15)" stroke="#fbbf24" strokeWidth="1.5" />
            <text x="205" y="52" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">Router 路由</text>
            <text x="205" y="70" fill="#94A3B8" fontSize="9" textAnchor="middle">选 Top-10 专家</text>

            {/* 512 专家网格示意 */}
            <g transform="translate(290,10)">
              {Array.from({ length: 16 }, (_, i) => {
                const isActive = i === 2 || i === 5 || i === 11;
                return (
                  <rect key={i}
                    x={(i % 4) * 45} y={Math.floor(i / 4) * 22}
                    width={40} height={18} rx={4}
                    fill={isActive ? 'rgba(196,181,253,0.35)' : 'rgba(255,255,255,0.04)'}
                    stroke={isActive ? '#c4b5fd' : 'rgba(255,255,255,0.08)'}
                    strokeWidth={isActive ? 1.8 : 1}
                  />
                );
              })}
              <text x="90" y="102" fill="#94A3B8" fontSize="10" textAnchor="middle">512 个小专家（激活 10 个）</text>
            </g>
          </g>
        )}

        <FlowLine x1={480} y1={57} x2={550} y2={57} color="#10b981" />
        <rect x="560" y="35" width="100" height="44" rx={8} fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="1.2" />
        <text x="610" y="62" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">输出特征</text>
      </g>

      <text x="20" y="254" fill="#94A3B8" fontSize="12.5">
        {modelType === 'dense'
          ? 'Dense 模式：所有参数都在干活，能力稳定但无法扩展到万亿级参数。'
          : 'MoE 模式：参数量巨大（2.4T），但每次只激活 95B 活跃参数，计算成本低得多！'}
      </text>
    </svg>
  );
};

/* ---------- Scene 2: Router 打分分诊 ---------- */
const Scene2: React.FC = () => {
  const [selectedExpert, setSelectedExpert] = React.useState(2);
  const experts = [
    { name: '专家 #1 (代码)', score: 0.12 },
    { name: '专家 #2 (数学)', score: 0.05 },
    { name: '专家 #3 (中文自然语言)', score: 0.88, active: true },
    { name: '专家 #4 (推理逻辑)', score: 0.74, active: true },
    { name: '专家 #5 (多语言)', score: 0.02 },
  ];

  return (
    <svg viewBox="0 0 760 280" width="100%" height="280">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">Router 打分：前台智能分诊</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">
        Router 用简单点积给 512 个专家打分，挑选得分最高的前 N 个专家（Top-K）。点击专家查看：
      </text>

      {/* 专家列表 */}
      <g transform="translate(20,74)">
        {experts.map((exp, i) => (
          <g key={i} style={{ cursor: 'pointer' }} onClick={() => setSelectedExpert(i)}>
            <rect x={0} y={i * 36} width={320} height={30} rx={6}
              fill={exp.active ? 'rgba(196,181,253,0.18)' : 'rgba(255,255,255,0.03)'}
              stroke={exp.active ? '#c4b5fd' : 'rgba(255,255,255,0.08)'}
              strokeWidth={selectedExpert === i ? 2 : 1} />
            <text x={12} y={i * 36 + 20} fill={exp.active ? '#c4b5fd' : '#94A3B8'} fontSize="11" fontWeight={exp.active ? 'bold' : 'normal'}>
              {exp.name}
            </text>
            {/* 概率柱 */}
            <rect x="180" y={i * 36 + 8} width={Math.max(4, exp.score * 120)} height={14} rx={3}
              fill={exp.active ? '#c4b5fd' : '#64748B'} opacity={exp.active ? 0.9 : 0.4} />
            <text x="310" y={i * 36 + 20} fill="#E2E8F0" fontSize="10" fontFamily="monospace" textAnchor="end">
              {(exp.score * 100).toFixed(0)}%
            </text>
          </g>
        ))}
      </g>

      {/* 解释卡 */}
      <g transform="translate(370,74)">
        <rect x="0" y="0" width="370" height="174" rx={10} fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.2)" />
        <text x="15" y="28" fill="#fbbf24" fontSize="13" fontWeight="bold">选中：{experts[selectedExpert].name}</text>
        <text x="15" y="54" fill="#94A3B8" fontSize="11">
          得分概率：{(experts[selectedExpert].score * 100).toFixed(1)}%
        </text>
        <text x="15" y="78" fill={experts[selectedExpert].active ? '#10b981' : '#EF4444'} fontSize="11" fontWeight="bold">
          状态：{experts[selectedExpert].active ? '已激活 (Top-K 选定)' : '未激活 (不计入计算)'}
        </text>
        <text x="15" y="110" fill="#94A3B8" fontSize="11">
          Qwen 3.8 采用 Softmax 路由门控，每个 Token 经过 Router 后只发送给得分最高的目标专家。
        </text>
      </g>

      <text x="20" y="266" fill="#94A3B8" fontSize="12">
        只有得分进入前 Top-K 的专家才会真正执行计算，其余未激活专家的权重不用加载进 GPU 计算。
      </text>
    </svg>
  );
};

/* ---------- Scene 3: 共享专家 (Shared Expert) ---------- */
const Scene3: React.FC = () => {
  return (
    <svg viewBox="0 0 760 260" width="100%" height="260">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">共享专家：永远在线的基础保障</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">
        除了 512 个路由选择的路由专家，Qwen 3.8 还设立了 1 个<tspan fill="#10b981" fontWeight="bold">共享专家</tspan>（Shared Expert）。
      </text>

      <g transform="translate(20,80)">
        {/* Token 输入 */}
        <TokenChip text="Token" x={0} y={40} w={70} color="#67e8f9" />

        {/* 分叉箭头 */}
        <FlowLine x1={80} y1={57} x2={150} y2={25} color="#10b981" />
        <FlowLine x1={80} y1={57} x2={150} y2={90} color="#c4b5fd" />

        {/* 共享专家 */}
        <rect x="160" y="0" width="180" height="50" rx={8} fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1.5" />
        <text x="250" y="24" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">1 × 共享专家 (Shared)</text>
        <text x="250" y="40" fill="#94A3B8" fontSize="10" textAnchor="middle">处理所有 Token 共享通用特征</text>

        {/* 路由专家 */}
        <rect x="160" y="65" width="180" height="50" rx={8} fill="rgba(196,181,253,0.15)" stroke="#c4b5fd" strokeWidth="1.5" />
        <text x="250" y="89" fill="#c4b5fd" fontSize="12" fontWeight="bold" textAnchor="middle">Top-K 路由专家 (Routed)</text>
        <text x="250" y="105" fill="#94A3B8" fontSize="10" textAnchor="middle">处理特定领域的专有特征</text>

        {/* 汇合 */}
        <FlowLine x1={350} y1={25} x2={420} y2={57} color="#10b981" />
        <FlowLine x1={350} y1={90} x2={420} y2={57} color="#c4b5fd" />

        {/* 相加 */}
        <circle cx={435} cy={57} r="12" fill="rgba(251,191,36,0.2)" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="435" y="61" fill="#fbbf24" fontSize="14" fontWeight="bold" textAnchor="middle">+</text>

        <FlowLine x1={450} y1={57} x2={520} y2={57} color="#fbbf24" />
        <rect x="530" y="35" width="120" height="44" rx={8} fill="rgba(251,191,36,0.1)" stroke="#fbbf24" strokeWidth="1.2" />
        <text x="590" y="62" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">加权融合输出</text>
      </g>

      <text x="20" y="225" fill="#94A3B8" fontSize="12.5">
        共享专家捕捉所有 Token 共同的通用语言规律，避免通用知识重复存储在各个路由专家中。
      </text>
    </svg>
  );
};

export const LessonMoE: BeginnerLesson = {
  id: 'moe',
  label: 'MoE 专家路由',
  emoji: '🔀',
  title: '第 4 课 · MoE 混合专家路由',
  subtitle: '用小模型的激活成本，享受万亿级参数的超级大脑。',
  scenes: [
    {
      title: 'Dense vs MoE：全科医生 vs 专家大医院',
      analogy: '一个全科大夫看所有病，还是医院根据病情分配给最合适的专家？',
      explain: <>Dense 模型（如 27B）每次计算激活全部参数；MoE 模型（如 2.4T）有 <b>512 个专家</b>，但每次只需激活少部分。</>,
      visual: <Scene1 />,
      keypoint: 'MoE 参数量巨大但单次计算成本很低——实现高效扩展。',
    },
    {
      title: 'Router 打分：前台智能分诊',
      analogy: '医院导诊台给病患挂号，直接引荐给相关科室的专家。',
      explain: <>Router 对 512 个专家打分，选出得分最高的几个专家（Top-K），将 Token 发送给它们处理。</>,
      visual: <Scene2 />,
      keypoint: '路由机制确保只有关联度最高的专家参与计算。',
    },
    {
      title: '共享专家：永远在线的基础保障',
      analogy: '除了专科医生，还有基础护士全程陪同处理通用事务。',
      explain: <>Qwen 3.8 设立了<b>共享专家 (Shared Expert)</b>，处理所有 Token 的通用特征，与路由专家配合加权输出。</>,
      visual: <Scene3 />,
      keypoint: '共享专家 + 路由专家相辅相成，保证通用知识与专业知识不冲突。',
    },
  ],
};
